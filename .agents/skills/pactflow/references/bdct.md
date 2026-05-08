# Bi-Directional Contract Testing (BDCT)

BDCT is a PactFlow Cloud-only feature that removes the need for the provider to run consumer pact tests directly. Instead, the provider publishes its OpenAPI specification and the results of a self-verification tool (e.g. Dredd, Schemathesis, Postman). PactFlow performs the cross-contract comparison automatically.

## When to Use BDCT

- The provider team cannot or will not run consumer Pact tests in their pipeline
- The provider already has API spec-based testing (Dredd, Schemathesis, etc.)
- Migrating an existing REST API to contract testing with minimal provider-side changes
- Large organisations where consumer and provider teams are loosely coupled

## BDCT Workflow

```
Provider publishes OpenAPI spec + self-verification results
      ↓
contract-testing_publish_provider_contract
      ↓
PactFlow performs cross-contract verification automatically
      ↓
Consumer publishes pact (same as standard flow)
contract-testing_publish_consumer_contracts
      ↓
can-i-deploy checks BDCT cross-contract results
contract-testing_can_i_deploy
      ↓
Deploy + record
contract-testing_record_deployment
```

## Publishing a Provider Contract

```
contract-testing_publish_provider_contract
  providerName: "OrderService"
  pacticipantVersionNumber: "def5678"
  branch: "main"
  buildUrl: "https://ci.example.com/builds/99"
  contract:
    content: "<base64-encoded OpenAPI YAML or JSON>"
    contentType: "application/yaml"   # or application/json
    specification: "oas"
    selfVerificationResults:
      success: true
      verifier: "dredd"              # or schemathesis, postman, etc.
      # content and format are optional — include if you want results stored
```

The `selfVerificationResults.success` boolean is critical — PactFlow will not mark the provider as verified unless this is `true`.

## Investigating BDCT Failures

Start broad, then drill down:

### 1. Cross-contract results for a provider version

```
contract-testing_get_bdct_cross_contract_verification_results
  providerName: "OrderService"
  providerVersionNumber: "def5678"
```

This shows the overall pass/fail and which consumer pact interactions failed the spec comparison.

### 2. Consumer contracts that were compared

```
contract-testing_get_bdct_consumer_contracts
  providerName: "OrderService"
  providerVersionNumber: "def5678"
```

Lists all consumer pact files that PactFlow used in the cross-contract verification.

### 3. Provider self-verification results

```
contract-testing_get_bdct_provider_contract_verification_results
  providerName: "OrderService"
  providerVersionNumber: "def5678"
```

The output of the provider's own spec-verification tool (Dredd, Schemathesis, etc.). If `success: false`, the provider failed its own self-verification — the OpenAPI spec doesn't match the implementation.

### 4. Pinpointing a specific consumer-provider version pair

When you know which consumer version is failing:

```
# The cross-contract result for this exact pair
contract-testing_get_bdct_cross_contract_verification_results_by_consumer_version
  providerName: "OrderService"
  providerVersionNumber: "def5678"
  consumerName: "CheckoutApp"
  consumerVersionNumber: "abc1234"

# The consumer's pact that was compared
contract-testing_get_bdct_consumer_contract_by_consumer_version
  providerName: "OrderService"
  providerVersionNumber: "def5678"
  consumerName: "CheckoutApp"
  consumerVersionNumber: "abc1234"

# The provider's OpenAPI spec that was used
contract-testing_get_bdct_provider_contract_by_consumer_version
  providerName: "OrderService"
  providerVersionNumber: "def5678"
  consumerName: "CheckoutApp"
  consumerVersionNumber: "abc1234"
```

## BDCT vs Standard Pact: Key Differences

| Aspect                       | Standard Pact                               | BDCT                                               |
| ---------------------------- | ------------------------------------------- | -------------------------------------------------- |
| Provider runs consumer tests | Yes                                         | No                                                 |
| Provider publishes           | Verification results (via pact library)     | OpenAPI spec + self-verification results           |
| Cross-contract verification  | Done by provider test suite                 | Done by PactFlow automatically                     |
| Consumer side                | Same (publish pact, run can-i-deploy)       | Same                                               |
| Availability                 | Cloud + On-Prem + Open Source Broker        | PactFlow Cloud only                                |
| Best for                     | Tight teams with shared test infrastructure | Loosely coupled teams; existing spec-based testing |

## Common Issues

**Cross-contract verification fails even though provider self-verification passed** — The OpenAPI spec doesn't fully cover what the consumer expects. Common causes: the spec uses `additionalProperties: false` and the consumer sends extra fields; response body schema is too strict; missing response headers the consumer expects.

**`success: false` in self-verification results** — The provider's implementation doesn't match its own OpenAPI spec. The provider needs to fix either the implementation or the spec before BDCT can pass.

**Consumer pact publishes fine but can-i-deploy still fails** — Check `contract-testing_get_bdct_cross_contract_verification_results` for the specific provider version deployed in the target environment. The provider may need to re-publish a new version with an updated spec.
