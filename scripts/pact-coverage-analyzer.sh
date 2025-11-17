#!/bin/bash

# Force Claude Code to give detailed output
ANALYSIS_DIR=${1:-.}

cat << 'EOF' > detailed-prompt.md
I need a COMPLETE, DETAILED analysis. Do NOT summarize. Output EXACTLY this format:

## Coverage Summary
| Metric | Value |
|--------|-------|
| Coverage Percentage | [calculate]% |
| Total API Scenarios | [count] |
| Total Pact Interactions | [count] |
| Pact Test File Status | ✅ Has Tests / ❌ Empty |

## Coverage Details
| API Resource     | HTTP Method | Path          | Scenario | Status |
|------------------|-------------|---------------|----------|--------|
| getAllProducts   | GET         | /products     | 200      | ✅/❌   |
| getAllProducts   | GET         | /products     | 401      | ✅/❌   |
| someOperation    | POST        | /op/{id}      | 404      | ✅/❌   |

## 🚨 Coverage Gaps & Recommendations
- List each missing test case
- Provide specific implementation recommendations

ANALYZE THESE FILES:

=== API CLIENT ===
EOF

cat "$ANALYSIS_DIR/src/api.js" >> detailed-prompt.md

cat << 'EOF' >> detailed-prompt.md

=== OPENAPI SPEC ===
EOF

cat "$ANALYSIS_DIR/products.yml" >> detailed-prompt.md

cat << 'EOF' >> detailed-prompt.md

=== PACT FILE ===
EOF

cat "$ANALYSIS_DIR/pacts/AIExampleConsumer-AIExampleProvider.json" >> detailed-prompt.md

cat << 'EOF' >> detailed-prompt.md

=== PACT TESTS ===
EOF

cat "$ANALYSIS_DIR/src/api.pact.spec.ts" >> detailed-prompt.md

cat << 'EOF' >> detailed-prompt.md

REQUIREMENTS:
1. Fill in ALL table rows with actual data
2. Calculate coverage percentage as: (covered scenarios / total API scenarios) * 100
3. List every missing test scenario
4. Do NOT summarize - provide complete detailed output
5. Follow the exact table format shown above

**Analysis Rules:**
- Only consider methods that exist in the API client - ignore OpenAPI-only endpoints
- Check for coverage of common (or as documented in the OpenAPI spec) HTTP status codes: 200 (success), 400 (bad request), 401 (unauthorized), 404 (not found)
- Mark as covered if ANY Pact test exists for that method/endpoint and status code combination
- Calculate coverage percentage as: (covered scenarios / total API scenarios) * 100
- **Total API Scenarios = sum of all unique combinations of (HTTP method + path + status code) that should be tested based on the API client methods and OpenAPI spec**
- **Each row in the Coverage Details table represents ONE scenario (one method + path + status code combination)**

**CRITICAL VALIDATION STEPS:**
1. **Before creating the Coverage Details table**: List out all scenarios you identified above
2. **After creating the Coverage Details table**: Count the actual rows in your table
3. **Final Check**: Verify the row count matches your "Total API Scenarios" in the Coverage Summary
4. **If they don't match**: Re-examine your analysis and fix the discrepancy before finalizing

START YOUR RESPONSE WITH "## Coverage Summary"
EOF

echo "📊 Running detailed analysis..."
cat detailed-prompt.md
echo ""
claude --print --output-format text < detailed-prompt.md > coverage-analysis.md