# End-to-End Contract Testing Workflow

This guide covers the two main workflows — Standard Pact and Bi-Directional Contract Testing (BDCT) — with exact tool calls at each step. For BDCT specifics, see `bdct.md`.

---

## Standard Pact Workflow (Consumer-Driven)

### Step 1: Consumer writes tests and generates a pact file

The consumer's test suite (using pact-js, pact-jvm, pact-go, etc.) generates a `.json` pact file. No MCP tool needed — this happens in the consumer's CI pipeline.

If the consumer doesn't have tests yet, generate them with AI:

```
contract-testing_generate_pact_tests
  language: "javascript"           # or java, go, python, ruby, etc.
  request_response:
    request: "GET /users/123 HTTP/1.1"
    response: "200 OK { id: 123, name: 'Alice' }"
  additional_instructions: "use pact-js v13, vitest"
```

Before generating, fetch existing provider states so the AI reuses them:

```
contract-testing_get_provider_states
  provider: "UserService"
```

### Step 2: Publish the pact

Run after consumer tests pass in CI:

```
contract-testing_publish_consumer_contracts
  pacticipantName: "FrontendApp"
  pacticipantVersionNumber: "abc1234"   # git SHA or semver
  branch: "main"
  contracts:
    - consumerName: "FrontendApp"
      providerName: "UserService"
      content: "<base64-encoded pact JSON>"
      contentType: "application/json"
      specification: "pact"
  buildUrl: "https://ci.example.com/builds/42"
```

### Step 3: Provider fetches pacts to verify

In the provider's CI pipeline:

```
contract-testing_get_pacts_for_verification
  providerName: "UserService"
  providerVersionBranch: "main"
  consumerVersionSelectors:
    - { mainBranch: true }
    - { deployedOrReleased: true }
  includePendingStatus: true
  includeWipPactsSince: "2024-01-01"
```

- `mainBranch: true` — verify the latest consumer main branch pact
- `deployedOrReleased: true` — verify pacts from versions already in any environment
- `includePendingStatus` — allows new consumer pacts to fail without breaking the provider build (pending pacts)
- `includeWipPactsSince` — include WIP pacts (new consumer interactions not yet verified) for early feedback

### Step 4: Provider verifies and publishes results

The provider runs its verification suite. Results are published back to the broker automatically by the Pact library (no MCP tool needed — handled by the pact-verifier).

### Step 5: Check can-i-deploy

Run this in CI as a gate **before** deploying:

```
contract-testing_can_i_deploy
  pacticipant: "FrontendApp"
  version: "abc1234"
  environment: "production"
```

- Returns success (exit 0) or failure (exit 1) with a human-readable explanation
- If it fails, use the Matrix to diagnose (see below)

### Step 6: Deploy and record

After a successful deploy:

```
contract-testing_record_deployment
  pacticipantName: "FrontendApp"
  versionNumber: "abc1234"
  environmentId: "<uuid-of-production>"
```

Get the environment UUID if you don't have it:

```
contract-testing_list_environments
```

For blue/green deployments, use `applicationInstance: "blue"` or `"green"` in record-deployment.

---

## Diagnosing a Failed can-i-deploy

When can-i-deploy fails, use the Matrix to understand why:

```
contract-testing_matrix
  q:
    - { pacticipant: "FrontendApp", latest: true, branch: "main" }
    - { pacticipant: "UserService", deployed: true, environment: "production" }
  latestby: "cvp"
```

The matrix shows every consumer-provider version combination and its verification status. Look for rows marked as failed and check the reason — usually an unverified or failing interaction.

---

## Setting Up a New Service

```
# 1. Register the service
contract-testing_create_pacticipant
  name: "PaymentService"
  displayName: "Payment Service"
  mainBranch: "main"
  repositoryUrl: "https://github.com/example/payment-service"

# 2. Confirm it was created
contract-testing_get_pacticipant
  pacticipantName: "PaymentService"

# 3. Discover existing environments (get their UUIDs)
contract-testing_list_environments

# 4. Create new environments if needed
contract-testing_create_environment
  name: "staging"
  displayName: "Staging"
  production: false
```

---

## Mobile / Library Release Workflow

For services where multiple versions coexist simultaneously (mobile apps, shared libraries):

```
# After release (not deploy)
contract-testing_record_release
  pacticipantName: "MobileApp"
  versionNumber: "3.2.1"
  environmentId: "<uuid-of-production>"

# Check what's still supported
contract-testing_get_currently_supported_versions
  environmentId: "<uuid-of-production>"
```

Unlike `record_deployment` (which supersedes the previous version), `record_release` keeps all released versions marked as "supported" simultaneously.

---

## Keeping the Workspace Clean

```
# Remove stale feature branches after merge
contract-testing_delete_branch
  pacticipantName: "FrontendApp"
  branchName: "feature/old-feature"

# Remove a decommissioned service
contract-testing_delete_pacticipant
  pacticipantName: "LegacyService"
```
