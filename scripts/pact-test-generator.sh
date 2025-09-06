#!/bin/bash

# Generalized Pact Test Generator with SmartBear MCP Tools
# Usage: ./pact-test-generator.sh [directory]

ANALYSIS_DIR=${1:-.}

echo "🧪 Generating Pact tests using SmartBear MCP tools for: $ANALYSIS_DIR"
echo "======================================================================="

# Create comprehensive test generation prompt
cat << 'EOF' > generalized-pact-prompt.md
CRITICAL INSTRUCTION: You MUST use SmartBear MCP tools to generate complete TypeScript Pact test code. 
I need a COMPLETE, DETAILED Pact Test as output. Do NOT summarize. Output EXACTLY this format:

START OUTPUT FORMAT:

```typescript
[Complete TypeScript Pact Test File Content Here]
```

```md
The complete TypeScript Pact test file above provides 100% coverage for your API client with all required scenarios:

**Coverage Summary**:

- GET /some/api: 4 test cases (200, 400, 401, 404)
- GET /some/other/:id: 4 test cases (200, 400, 401, 404)
- Total: 8 comprehensive test scenarios vs. the original 1 test

**Key Features**:

- Covers both happy path (200) and error scenarios (400, 401, 404)
- ...
- This complete file should replace your existing src/api.pact.spec.ts to achieve the required 100% Pact test coverage.

END OUTPUT FORMAT:

Your task is to:
1. Discover and analyze the API client files in the project
2. Review missing Pact test coverage gaps
3. Use the mcp__smartbear__contract-testing_generate_pact_tests tool for each missing API method
4. Generate a complete, working TypeScript test file

MANDATORY REQUIREMENTS:
- Call mcp__smartbear__contract-testing_generate_pact_tests for each missing API method identified in the coverage analysis
- Generate tests for ALL missing scenarios identified in the coverage analysis above
- Include scenarios: 200 (success), 400 (bad request), 401 (unauthorized), 404 (not found) and any other relevant status codes
- Follow the existing test template pattern exactly
- Generate ONE complete file that replaces src/api.pact.spec.ts

DISCOVERY PROCESS
1. Read the current API client (src/api.js) and model (src/product.js) and related API client files
2. Read the existing test template (src/pact.test.template) and instructions (src/test.instructions.txt)
3. Read the existing Pact test file (src/api.pact.spec.ts) to understand current test structure and pact file (pacts/AIExampleConsumer-AIExampleProvider.json) for existing interactions
4. Read the existing openAPI spec (products.yml) to identify all API endpoints and methods
5. For each missing API method missing a test, call the SmartBear MCP mcp__smartbear__contract-testing_generate_pact_tests tool
6. Combine all generated tests with existing tests into one complete TypeScript file
7. Output the complete merged file wrapped in triple backticks typescript blocks

SMARTBEAR MCP TOOL USAGE:
========================
For each missing API method identified, call:
mcp__smartbear__contract-testing_generate_pact_tests

Required JSON structure:
{
  "language": "typescript",
  "code": [
    {"filename": "[discovered_api_client_file]", "body": "[full file content]"},
    {"filename": "[discovered_model_files]", "body": "[full file content]"}
  ],
  "testTemplate": {"filename": "[discovered_template_file]", "body": "[template content]"},
  "openapi": {
    "document": "[openapi_document_object]",
    "matcher": {
      "path": "[specific_endpoint_path]",
      "methods": ["[HTTP_METHODS]"],
      "statusCodes": [200, 400, 401, 404],
      "operationId": "[operation_id]"
    }
  },
  "additionalInstructions": "[test instructions - see below]"
}

TEST INSTRUCTIONS FOR MCP TOOL:
==============================
EOF

cat << 'EOF' >> generalized-pact-prompt.md
cat "src/test.instructions.txt" >> generalized-pact-prompt.md

PROJECT FILES TO ANALYZE:
=========================
EOF

echo "📁 Discovering project files..."

# Add all relevant files found in the directory
echo "### Discovered Files:" >> generalized-pact-prompt.md
echo "" >> generalized-pact-prompt.md

# Find existing coverage analysis
echo "#### Existing Coverage Analysis:" >> generalized-pact-prompt.md
echo "**File: coverage-analysis.md**" >> generalized-pact-prompt.md
echo '```json' >> generalized-pact-prompt.md
cat "${ANALYSIS_DIR}/coverage-analysis.md" >> generalized-pact-prompt.md
echo '```' >> generalized-pact-prompt.md
echo "" >> generalized-pact-prompt.md

# Find API client files (look for HTTP methods)
echo "#### API Client Files:" >> generalized-pact-prompt.md
echo "**File: src/api.js**" >> generalized-pact-prompt.md
echo '```javascript' >> generalized-pact-prompt.md
cat "${ANALYSIS_DIR}/src/api.js" >> generalized-pact-prompt.md
echo '```' >> generalized-pact-prompt.md
echo "" >> generalized-pact-prompt.md

# Find model/entity files (look for class definitions or exports)
echo "#### Model/Entity Files:" >> generalized-pact-prompt.md
echo "**File: src/product.js**" >> generalized-pact-prompt.md
echo '```javascript' >> generalized-pact-prompt.md
cat "${ANALYSIS_DIR}/src/product.js" >> generalized-pact-prompt.md
echo '```' >> generalized-pact-prompt.md
echo "" >> generalized-pact-prompt.md

# Find existing Pact test files
echo "#### Existing Pact Test Files:" >> generalized-pact-prompt.md
echo "**File: src/api.pact.spec.ts**" >> generalized-pact-prompt.md
echo '```typescript' >> generalized-pact-prompt.md
cat "${ANALYSIS_DIR}/src/api.pact.spec.ts" >> generalized-pact-prompt.md
echo '```' >> generalized-pact-prompt.md
echo "" >> generalized-pact-prompt.md

# Find OpenAPI specifications
echo "#### OpenAPI Specifications:" >> generalized-pact-prompt.md
echo "**File: products.yml**" >> generalized-pact-prompt.md
echo '```yaml' >> generalized-pact-prompt.md
cat "${ANALYSIS_DIR}/products.yml" >> generalized-pact-prompt.md
echo '```' >> generalized-pact-prompt.md
echo "" >> generalized-pact-prompt.md

# Find test templates
echo "#### Test Templates:" >> generalized-pact-prompt.md
echo "**File: src/pact.test.template**" >> generalized-pact-prompt.md
echo '```' >> generalized-pact-prompt.md
cat "${ANALYSIS_DIR}/src/pact.test.template" >> generalized-pact-prompt.md
echo '```' >> generalized-pact-prompt.md
echo "" >> generalized-pact-prompt.md

cat << 'EOF' >> generalized-pact-prompt.md

EXECUTION STEPS:
===============
1. **Analysis Phase**: 
   - Identify all API client methods from the discovered files
   - Identify missing tests to create from the given coverage analysis

2. **Generation Phase**:
   - For each API method missing comprehensive tests, call mcp__smartbear__contract-testing_generate_pact_tests
   - Use the discovered test template if available
   - Use the discovered openapi description if available, passing in all relevant status codes
   - Include the test instructions provided above

3. **Integration Phase**:
   - Combine all generated tests with existing tests
   - Ensure no duplicate test scenarios
   - Output complete TypeScript file ready for use

CRITICAL OUTPUT REQUIREMENTS:
============================
1. Use SmartBear MCP tools - do not generate tests manually
2. Provide complete analysis of what was discovered
3. Output final complete TypeScript test file in code block
4. Ensure 100% coverage of discovered API methods

REMEMBER - DO NOT SUMMARIZE - provide the fully updated test file and all analysis details as output.
EOF

echo "🔄 Running analysis and test generation with SmartBear MCP tools..."
cat generalized-pact-prompt.md
echo ""
claude --mcp-config ~/.config/claude/mcp.json --allowedTools "Read,Write,mcp__smartbear__contract-testing_generate_pact_tests" --print --output-format text < generalized-pact-prompt.md > pr-recommendations.md

echo ""
echo "✅ Test generation complete!"