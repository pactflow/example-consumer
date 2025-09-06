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
2. Calculate exact coverage percentage 
3. List every missing test scenario
4. Do NOT summarize - provide complete detailed output
5. Follow the exact table format shown above

START YOUR RESPONSE WITH "## Coverage Summary"
EOF

echo "📊 Running detailed analysis..."
cat detailed-prompt.md
echo ""
claude --print --output-format text < detailed-prompt.md > coverage-analysis.md