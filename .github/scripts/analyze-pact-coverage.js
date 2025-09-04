#!/usr/bin/env node

/**
 * Pact Coverage Analysis Script
 * Analyzes API client methods against existing Pact test coverage
 * Used by GitHub Actions for automated PR reviews
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class PactCoverageAnalyzer {
  constructor() {
    this.apiClientPath = 'src/api.js';
    this.pactSpecPath = 'src/api.pact.spec.ts';
    this.pactFilePath = this.findPactFile();
    this.openApiPath = 'products.yml';
    this.productModelPath = 'src/product.js';
  }

  findPactFile() {
    const path = require('path');
    
    // Try to find any JSON file in the pacts directory
    try {
      const pactsDir = 'pacts';
      const files = fs.readdirSync(pactsDir);
      const pactFiles = files.filter(file => file.endsWith('.json'));
      
      if (pactFiles.length > 0) {
        console.log(`Found Pact file: ${pactFiles[0]}`);
        return `${pactsDir}/${pactFiles[0]}`;
      }
    } catch (e) {
      console.log('No pacts directory or files found');
    }
    
    // Fallback to default
    return 'pacts/ProductConsumer-ProductProvider.json';
  }

  analyzeApiClient() {
    try {
      const apiContent = fs.readFileSync(this.apiClientPath, 'utf8');
      const methods = [];

      // Extract async methods that make HTTP calls
      const methodRegex = /async\s+(\w+)\([^)]*\)\s*{[\s\S]*?return\s+axios\s*\.(\w+)\(this\.withPath\("([^"]+)"/g;
      let match;
      
      while ((match = methodRegex.exec(apiContent)) !== null) {
        methods.push({
          name: match[1],
          httpMethod: match[2].toUpperCase(),
          path: match[3],
          fullMatch: match[0]
        });
      }

      return methods;
    } catch (error) {
      console.error('Error analyzing API client:', error.message);
      return [];
    }
  }

  analyzePactFile() {
    try {
      if (!fs.existsSync(this.pactFilePath)) {
        return [];
      }
      
      const pactContent = JSON.parse(fs.readFileSync(this.pactFilePath, 'utf8'));
      return pactContent.interactions || [];
    } catch (error) {
      console.error('Error analyzing Pact file:', error.message);
      return [];
    }
  }

  analyzeOpenApiSpec() {
    try {
      if (!fs.existsSync(this.openApiPath)) {
        return { paths: {} };
      }
      
      const openApiContent = fs.readFileSync(this.openApiPath, 'utf8');
      return yaml.load(openApiContent);
    } catch (error) {
      console.error('Error analyzing OpenAPI spec:', error.message);
      return { paths: {} };
    }
  }

  analyzePactTestFile() {
    try {
      if (!fs.existsSync(this.pactSpecPath)) {
        return { isEmpty: true, testCount: 0 };
      }
      
      const testContent = fs.readFileSync(this.pactSpecPath, 'utf8');
      
      // Count test blocks
      const testMatches = testContent.match(/test\(|it\(/g);
      const testCount = testMatches ? testMatches.length : 0;
      
      // Check if file is mostly empty (just boilerplate)
      const hasInteractions = testContent.includes('addInteraction()');
      
      return {
        isEmpty: !hasInteractions,
        testCount,
        hasInteractions
      };
    } catch (error) {
      console.error('Error analyzing Pact test file:', error.message);
      return { isEmpty: true, testCount: 0 };
    }
  }

  generateCoverageReport() {
    const apiMethods = this.analyzeApiClient();
    const pactInteractions = this.analyzePactFile();
    const openApiSpec = this.analyzeOpenApiSpec();
    const pactTestFile = this.analyzePactTestFile();

    // Analyze coverage for each API method
    const coverage = apiMethods.map(apiMethod => {
      // Find matching Pact interactions
      const matchingInteractions = pactInteractions.filter(interaction => {
        const requestMethod = interaction.request.method.toUpperCase();
        const requestPath = interaction.request.path;
        
        // Check for method match
        const methodMatch = requestMethod === apiMethod.httpMethod;
        
        // Check for path match (handle parametrized paths)
        let pathMatch = false;
        if (apiMethod.path.includes('{')) {
          // Handle parametrized paths like /product/{id} vs /product/1
          const apiPathPattern = apiMethod.path.replace(/\{[^}]+\}/g, '[^/]+');
          const regex = new RegExp(`^${apiPathPattern}$`);
          pathMatch = regex.test(requestPath);
        } else {
          // Exact path match for non-parametrized paths
          pathMatch = requestPath === apiMethod.path;
        }
        
        return methodMatch && pathMatch;
      });

      // Analyze scenarios covered
      const scenarios = {
        success: false,
        badRequest: false,
        unauthorized: false,
        notFound: false,
        withAuth: false,
        withoutAuth: false
      };

      matchingInteractions.forEach(interaction => {
        const status = interaction.response.status;
        const hasAuth = interaction.request.headers && interaction.request.headers.Authorization;
        
        switch (status) {
          case 200:
            scenarios.success = true;
            break;
          case 400:
            scenarios.badRequest = true;
            break;
          case 401:
            scenarios.unauthorized = true;
            break;
          case 404:
            scenarios.notFound = true;
            break;
        }
        
        if (hasAuth) {
          scenarios.withAuth = true;
        } else {
          scenarios.withoutAuth = true;
        }
      });

      return {
        apiMethod: apiMethod.name,
        httpMethod: apiMethod.httpMethod,
        path: apiMethod.path,
        covered: matchingInteractions.length > 0,
        interactionCount: matchingInteractions.length,
        scenarios,
        interactions: matchingInteractions.map(i => ({
          description: i.description,
          status: i.response.status,
          hasAuth: i.request.headers && i.request.headers.Authorization
        }))
      };
    });

    // Check for OpenAPI endpoints not in API client
    const openApiPaths = Object.keys(openApiSpec.paths || {});
    const apiClientPaths = apiMethods.map(m => m.path);
    const missingInClient = openApiPaths.filter(path => 
      !apiClientPaths.some(clientPath => {
        // Normalize both paths for comparison
        const normalizedOpenApiPath = path.replace(/\{[^}]+\}/g, '{id}');
        const normalizedClientPath = clientPath.replace(/\{[^}]+\}/g, '{id}');
        return normalizedOpenApiPath === normalizedClientPath;
      })
    );

    // Calculate overall statistics
    const totalMethods = apiMethods.length;
    const coveredMethods = coverage.filter(c => c.covered).length;
    const coveragePercentage = totalMethods > 0 ? Math.round((coveredMethods / totalMethods) * 100) : 0;

    return {
      summary: {
        totalApiMethods: totalMethods,
        coveredMethods,
        coveragePercentage,
        totalPactInteractions: pactInteractions.length,
        pactTestFileStatus: pactTestFile
      },
      coverage,
      gaps: {
        missingInClient,
        uncoveredMethods: coverage.filter(c => !c.covered),
        incompleteScenarios: coverage.filter(c => {
          const s = c.scenarios;
          return c.covered && (!s.success || !s.unauthorized || !s.notFound);
        })
      },
      recommendations: this.generateRecommendations(coverage, openApiSpec, pactTestFile)
    };
  }

  generateRecommendations(coverage, openApiSpec, pactTestFile) {
    const recommendations = [];

    if (pactTestFile.isEmpty) {
      recommendations.push({
        type: 'critical',
        title: 'Pact test file is empty or missing',
        description: 'The Pact test file needs to be implemented with proper test cases.',
        action: 'Use SmartBear MCP tools to generate comprehensive Pact tests'
      });
    }

    coverage.forEach(method => {
      if (!method.covered) {
        recommendations.push({
          type: 'missing',
          title: `No Pact tests for ${method.apiMethod}()`,
          description: `The ${method.httpMethod} ${method.path} endpoint has no Pact test coverage.`,
          action: `Add Pact tests covering 200, 401, and 404 scenarios for ${method.apiMethod}`
        });
      } else {
        const missing = [];
        if (!method.scenarios.success) missing.push('200 (success)');
        if (!method.scenarios.unauthorized) missing.push('401 (unauthorized)');
        if (!method.scenarios.notFound) missing.push('404 (not found)');
        
        if (missing.length > 0) {
          recommendations.push({
            type: 'incomplete',
            title: `Incomplete scenarios for ${method.apiMethod}()`,
            description: `Missing test scenarios: ${missing.join(', ')}`,
            action: `Add Pact test cases for missing HTTP status codes: ${missing.join(', ')}`
          });
        }
      }
    });

    return recommendations;
  }

  generateMarkdownReport() {
    const report = this.generateCoverageReport();
    
    let markdown = `# 📊 Pact Test Coverage Analysis\n\n`;
    
    // Coverage details
    markdown += `## Coverage Details\n\n`;
    markdown += `| API Method | HTTP Method | Path | Status | Interactions | Covered Scenarios |\n`;
    markdown += `|------------|-------------|------|--------|--------------|------------------|\n`;
    
    report.coverage.forEach(method => {
      const status = method.covered ? '✅ Covered' : '❌ Missing';
      const scenarios = [];
      if (method.scenarios.success) scenarios.push('✅ 200 (Success)');
      if (method.scenarios.unauthorized) scenarios.push('✅ 401 (Unauthorized)');
      if (method.scenarios.notFound) scenarios.push('✅ 404 (Not Found)');
      if (method.scenarios.badRequest) scenarios.push('✅ 400 (Bad Request)');
      
      const scenarioText = scenarios.length > 0 ? scenarios.join('<br/>') : '❌ None';
      markdown += `| ${method.apiMethod} | ${method.httpMethod} | ${method.path} | ${status} | ${method.interactionCount} | ${scenarioText} |\n`;
    });
    
    // Gaps and recommendations
    if (report.recommendations.length > 0) {
      markdown += `\n## 🚨 Coverage Gaps & Recommendations\n\n`;
      
      const critical = report.recommendations.filter(r => r.type === 'critical');
      const missing = report.recommendations.filter(r => r.type === 'missing');
      const incomplete = report.recommendations.filter(r => r.type === 'incomplete');
      
      if (critical.length > 0) {
        markdown += `### 🔴 Critical Issues\n\n`;
        critical.forEach(rec => {
          markdown += `- **${rec.title}**: ${rec.description}\n`;
          markdown += `  - *Action*: ${rec.action}\n\n`;
        });
      }
      
      if (missing.length > 0) {
        markdown += `### 📝 Missing Coverage\n\n`;
        missing.forEach(rec => {
          markdown += `- **${rec.title}**: ${rec.description}\n`;
          markdown += `  - *Action*: ${rec.action}\n\n`;
        });
      }
      
      if (incomplete.length > 0) {
        markdown += `### ⚠️ Incomplete Coverage\n\n`;
        incomplete.forEach(rec => {
          markdown += `- **${rec.title}**: ${rec.description}\n`;
          markdown += `  - *Action*: ${rec.action}\n\n`;
        });
      }
    }
    
    return markdown;
  }

  saveReports() {
    const report = this.generateCoverageReport();
    const markdown = this.generateMarkdownReport();
    
    // Save JSON report
    fs.writeFileSync('coverage-report.json', JSON.stringify(report, null, 2));
    
    // Save markdown report
    fs.writeFileSync('coverage-analysis.md', markdown);
    
    return report;
  }
}

// Check if js-yaml is available, if not provide a simple YAML parser
if (!fs.existsSync('node_modules/js-yaml')) {
  // Simple YAML parsing for the basic OpenAPI structure we need
  const yaml = {
    load: (content) => {
      try {
        // Very basic YAML parsing - this is a fallback
        const lines = content.split('\n');
        const result = { paths: {} };
        let currentPath = null;
        
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('/') && trimmed.endsWith(':')) {
            currentPath = trimmed.slice(0, -1);
            result.paths[currentPath] = {};
          }
        });
        
        return result;
      } catch (e) {
        return { paths: {} };
      }
    }
  };
  
  module.exports = { yaml };
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new PactCoverageAnalyzer();
  analyzer.saveReports();
}

module.exports = PactCoverageAnalyzer;
