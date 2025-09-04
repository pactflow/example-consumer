# Pact Coverage Analysis Scripts

This directory contains automated analysis tools for Pact contract test coverage in GitHub Actions.

## Files

### `analyze-pact-coverage.js`

A comprehensive Node.js script that analyzes:

- **API Client Methods**: Extracts all async methods from `src/api.js`
- **Pact Test Coverage**: Compares against existing Pact interactions
- **Scenario Coverage**: Checks for proper HTTP status code coverage (200, 400, 401, 404)
- **OpenAPI Alignment**: Verifies API client matches the OpenAPI specification
- **Test File Quality**: Analyzes the Pact test file completeness

#### Usage

```bash
# Run the analysis
node .github/scripts/analyze-pact-coverage.js

# Outputs:
# - coverage-report.json    # Detailed JSON report
# - coverage-analysis.md    # Human-readable markdown report
```

#### Output

The script generates:

1. **JSON Report** (`coverage-report.json`):
   - Detailed coverage statistics
   - Method-by-method analysis
   - Gap identification
   - Actionable recommendations

2. **Markdown Report** (`coverage-analysis.md`):
   - Human-readable coverage summary
   - Coverage table with status indicators
   - Prioritized recommendations
   - Action items

## GitHub Workflow Integration

The `pact-coverage-review` job in `.github/workflows/build.yml` uses these scripts to:

1. **Analyze Coverage**: Run the coverage analysis script
2. **Generate Recommendations**: Use Claude AI + SmartBear MCP tools for intelligent recommendations
3. **Create PR Comments**: Post detailed analysis as PR comments
4. **Generate Test Code**: Use SmartBear MCP to generate missing Pact tests
5. **Upload Artifacts**: Save all analysis reports for download

### Workflow Features

- **Automatic Triggering**: Runs on all pull requests
- **Smart Analysis**: Uses AI to understand code context and generate recommendations
- **Coverage Thresholds**: Flags PRs with coverage below 80%
- **Test Generation**: Automatically generates missing Pact test code
- **Artifact Storage**: Saves detailed reports for 30 days

## SmartBear MCP Integration

The workflow integrates with SmartBear's Model Context Protocol (MCP) tools:

- **Contract Test Generation**: `mcp_smartbear_contract-testing_generate_pact_tests`
- **Contract Test Review**: `mcp_smartbear_contract-testing_review_pact_tests`

These tools provide AI-powered capabilities for:
- Generating comprehensive Pact tests from API clients
- Reviewing existing tests for completeness
- Suggesting improvements based on best practices
- Ensuring proper coverage of error scenarios

## Environment Variables

The workflow requires these GitHub secrets:

- `PACT_BROKER_BASE_URL`: Your PactFlow broker URL
- `PACTFLOW_TOKEN_FOR_CI_CD_WORKSHOP`: Your PactFlow API token

## Coverage Analysis Features

### API Client Analysis
- Extracts all HTTP-calling methods from the API client
- Identifies HTTP methods and endpoints
- Maps to corresponding OpenAPI specification entries

### Pact Coverage Analysis
- Compares API client methods against Pact interactions
- Checks for proper scenario coverage:
  - Success scenarios (200)
  - Authentication errors (401)
  - Not found errors (404)
  - Bad request errors (400)
- Validates authorization header usage

### Gap Identification
- Missing Pact tests for API methods
- Incomplete scenario coverage
- OpenAPI/API client misalignment
- Test file quality issues

### Recommendations
- Prioritized action items
- Generated test code snippets
- Best practice guidance
- SmartBear MCP tool suggestions

## Example Output

The analysis generates markdown reports like:

```markdown
# 📊 Pact Test Coverage Analysis

## Coverage Summary
| Metric | Value |
|--------|-------|
| Total API Methods | 3 |
| Covered Methods | 2 |
| Coverage Percentage | 67% |

## Coverage Details
| API Method | HTTP Method | Path | Status | Scenarios |
|------------|-------------|------|--------|-----------|
| getAllProducts | GET | /products | ✅ | 200, 401 |
| getProduct | GET | /product/{id} | ✅ | 200, 401, 404 |
| deleteProduct | DELETE | /product/{id} | ❌ | None |

## 🚨 Coverage Gaps & Recommendations
- **Missing Coverage**: deleteProduct() has no Pact tests
- **Action**: Add Pact tests covering 200, 401, and 404 scenarios
```

## Local Development

To run the analysis locally:

```bash
# Install dependencies
npm install

# Run coverage analysis
node .github/scripts/analyze-pact-coverage.js

# View reports
cat coverage-analysis.md
```

This helps developers understand coverage gaps before creating PRs.
