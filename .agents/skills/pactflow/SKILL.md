---
name: pactflow
description: >
  Expert assistant for PactFlow and Pact contract testing. Use this skill whenever
  the user mentions PactFlow, Pact, contract testing, consumer-driven contracts, provider
  verification, can-i-deploy, pact broker, pacticipants, bi-directional contract testing
  (BDCT), publishing pacts, recording deployments, provider states, the contract matrix,
  or managing environments and versions in a PactFlow workspace. Also trigger when the
  user wants to generate or review Pact tests using AI, check deployment safety, investigate
  why a consumer-provider verification failed, or integrate contract testing into CI/CD.
  Trigger even if the user doesn't say "PactFlow" explicitly — phrases like "safe to deploy?",
  "check compatibility between services", "consumer test", "OpenAPI contract", or "service
  compatibility matrix" are strong signals.
compatibility:
  tools:
    - contract-testing_generate_pact_tests
    - contract-testing_review_pact_tests
    - contract-testing_get_provider_states
    - contract-testing_can_i_deploy
    - contract-testing_matrix
    - contract-testing_check_pactflow_ai_entitlements
    - contract-testing_get_metrics
    - contract-testing_get_team_metrics
    - contract-testing_list_pacticipants
    - contract-testing_get_pacticipant
    - contract-testing_create_pacticipant
    - contract-testing_update_pacticipant
    - contract-testing_patch_pacticipant
    - contract-testing_delete_pacticipant
    - contract-testing_list_branches
    - contract-testing_get_branch
    - contract-testing_delete_branch
    - contract-testing_get_branch_versions
    - contract-testing_list_pacticipant_versions
    - contract-testing_get_pacticipant_version
    - contract-testing_get_latest_pacticipant_version
    - contract-testing_update_pacticipant_version
    - contract-testing_list_environments
    - contract-testing_get_environment
    - contract-testing_create_environment
    - contract-testing_update_environment
    - contract-testing_delete_environment
    - contract-testing_record_deployment
    - contract-testing_get_currently_deployed_versions
    - contract-testing_get_deployed_versions_for_version
    - contract-testing_record_release
    - contract-testing_get_currently_supported_versions
    - contract-testing_get_released_versions_for_version
    - contract-testing_publish_consumer_contracts
    - contract-testing_publish_provider_contract
    - contract-testing_get_pacts_for_verification
    - contract-testing_get_bdct_provider_contract
    - contract-testing_get_bdct_provider_contract_verification_results
    - contract-testing_get_bdct_consumer_contracts
    - contract-testing_get_bdct_consumer_contract_verification_results
    - contract-testing_get_bdct_cross_contract_verification_results
    - contract-testing_get_bdct_consumer_contract_by_consumer_version
    - contract-testing_get_bdct_provider_contract_by_consumer_version
    - contract-testing_get_bdct_provider_contract_verification_results_by_consumer_version
    - contract-testing_get_bdct_consumer_contract_verification_results_by_consumer_version
    - contract-testing_get_bdct_cross_contract_verification_results_by_consumer_version
    - contract-testing_list_integrations
    - contract-testing_get_pacticipant_network
    - contract-testing_list_labels
    - contract-testing_get_pacticipant_label
    - contract-testing_list_pacticipants_by_label
    - contract-testing_add_label
    - contract-testing_remove_label
    - contract-testing_list_webhooks
    - contract-testing_get_webhook
    - contract-testing_create_webhook
    - contract-testing_update_webhook
    - contract-testing_delete_webhook
    - contract-testing_execute_webhook
    - contract-testing_list_secrets
    - contract-testing_get_secret
    - contract-testing_create_secret
    - contract-testing_update_secret
    - contract-testing_delete_secret
---

# PactFlow & Pact Contract Testing

You are an expert assistant for **PactFlow** and open-source **Pact** contract testing. You have access to the full suite of `contract-testing_*` MCP tools that connect directly to the user's PactFlow or Pact Broker workspace.

**Key references** — read these when you need depth on a specific topic:

### Setup & Configuration

- `references/mcp-setup.md` — **start here** if the user needs to install or configure the SmartBear MCP server
- `references/pact-broker-setup.md` — Pact Broker setup checklist, full CLI reference, webhook debugging, troubleshooting

### Core Concepts & Theory

- `references/pact-concepts.md` — terminology, how Pact works end-to-end, provider states deep-dive
- `references/pact-faq.md` — FAQ, what Pact is/isn't good for, comparisons vs E2E/schema/SCC, testing scope, contract vs functional tests

### Writing Tests

- `references/pact-consumer.md` — writing consumer tests, matching rules (regex, type, EachLike), recommended config
- `references/pact-provider.md` — provider verification, auth handling, fixing failures, provider states effectively
- `references/pact-messages.md` — async/message pact (Kafka, SQS, SNS), JS and Java examples, sync messages (gRPC)
- `references/pact-plugins.md` — Pact Plugin Framework: gRPC, Protobuf, custom transports/protocols; JS + JVM usage; building plugins
- `references/pact-implementations.md` — language-specific guides: JS, Go, JVM/Java, Ruby consumer + provider APIs
- `references/pact-recipes.md` — optional fields, GraphQL, Kafka, API Gateway, Cypress, UI testing patterns

### Pact Broker & CI/CD

- `references/pact-broker-advanced.md` — consumer version selectors, pending/WIP pacts, branches, deployments, webhooks
- `references/pact-cicd.md` — Pact Nirvana CI/CD guide (Bronze → Diamond), can-i-deploy deep-dive

### PactFlow & MCP Tools

- `references/workflow.md` — end-to-end workflow with exact MCP tool calls at each step
- `references/bdct.md` — Bi-Directional Contract Testing (BDCT) patterns and tools
- `references/tools.md` — full `contract-testing_*` tool catalog with parameters
- `references/pact-docs-index.md` — complete index of all docs.pact.io documentation with URLs

---

## MCP Setup

If the `contract-testing_*` tools are not available, the user needs to install and configure the SmartBear MCP server first. Read `references/mcp-setup.md` for full instructions covering:

- Authentication (PactFlow API token or Pact Broker username/password)
- Configuration for Claude Code, Claude Desktop, VS Code, and Cursor
- Environment variables: `PACT_BROKER_BASE_URL`, `PACT_BROKER_TOKEN`
- Verifying the connection works

---

## Core Concepts

**Pacticipant** — any application (consumer or provider) registered in the workspace. Every pact is associated with a consumer-provider pair of pacticipants.

**Pact** — a contract file generated by the consumer's test suite. It contains a list of HTTP interactions (request + expected response) that the consumer depends on.

**Provider verification** — the process of the provider running the consumer's pact against its own implementation to confirm it can honour all the interactions.

**can-i-deploy** — a compatibility gate that checks the contract matrix to determine whether a specific version of a service is safe to deploy to a given environment. Run it in CI _before_ deploying.

**Provider states** — named preconditions the provider sets up before verifying each interaction (e.g. "a user with id 123 exists"). Use `contract-testing_get_provider_states` to discover existing states before writing new consumer tests — this avoids duplication and promotes collaboration.

**Environments** — named deployment targets (e.g. `staging`, `production`) with UUIDs. Record deployments against them so can-i-deploy reflects real state.

**BDCT (Bi-Directional Contract Testing)** — an alternative flow where the provider publishes an OpenAPI spec + self-verification results instead of running the consumer pact suite directly. PactFlow performs cross-contract verification automatically. See `references/bdct.md`.

---

## Standard Pact Workflow

The typical flow for a consumer-driven contract testing setup:

```
Consumer tests run
      ↓
Pact file generated
      ↓
contract-testing_publish_consumer_contracts   ← upload pact + branch/version
      ↓
Provider CI picks up pact via:
contract-testing_get_pacts_for_verification   ← fetch pacts to verify
      ↓
Provider verifies pact against implementation
      ↓
contract-testing_can_i_deploy                 ← gate before deploy
      ↓
Deploy
      ↓
contract-testing_record_deployment            ← update workspace state
```

Read `references/workflow.md` for exact parameters at each step.

---

## PactFlow AI Features (Cloud only)

Use these when the user wants to **create or improve Pact tests with AI**:

**Generate tests** — `contract-testing_generate_pact_tests`

- Accepts: request/response pairs, code files, or an OpenAPI document + matcher
- Returns: complete Pact test in the target language
- Always fetch provider states first (`contract-testing_get_provider_states`) so the generated tests reuse existing state names

**Review tests** — `contract-testing_review_pact_tests`

- Accepts: existing pact test files, optional code context, optional error output from failed runs
- Returns: ranked list of recommendations aligned with best practices
- Useful for auditing older tests or fixing a broken verification

If either AI tool returns a 401 error, call `contract-testing_check_pactflow_ai_entitlements` to diagnose credit or permission issues.

---

## Diagnosing Can-i-deploy Failures

When `can-i-deploy` fails with "no verified pact between X and the version of Y deployed to production", work through this in order:

**1. Identify what is actually deployed in production**
```
contract-testing_get_currently_deployed_versions  →  environmentId: <prod-uuid>
```

**2. Inspect the Pact Matrix** — this is the source of truth for what has/hasn't been verified
```
contract-testing_matrix
  q: [{pacticipant: "ConsumerName", version: "abc123"}, {pacticipant: "ProviderName", deployed: true, environment: "production"}]
```
- No row → provider never verified this consumer version
- Row with `false` → verification ran and failed (genuine contract break)
- Row with `true` → check other integrated services

**3. Fix based on root cause**

| Root cause | Fix |
|---|---|
| Provider not verifying this consumer version | Add `{ deployedOrReleased: true }` to provider's `consumerVersionSelectors` |
| Verification results not published | Ensure `publishVerificationResults: true`, `providerVersion: $GIT_COMMIT`, `providerVersionBranch: $GIT_BRANCH` in provider CI |
| No webhook firing on pact changes | Create webhook with event `contract_requiring_verification_published` |
| PaymentService not recorded as deployed | Call `contract-testing_record_deployment` for the version currently in production |

For deeper investigation, read `references/pact-broker-advanced.md` and `references/pact-cicd.md`.

---

## Writing Consumer Tests and Provider Verification

When generating or reviewing Pact tests:

**Before writing tests** — check existing provider states and pacticipant names to avoid duplication:
```
contract-testing_get_provider_states  →  pacticipant: "ProviderName"
contract-testing_list_pacticipants    →  confirm exact names as registered in the broker
```

**Provider verification must-haves** — every provider verification config needs all three selectors and both flags:
```javascript
consumerVersionSelectors: [
  { mainBranch: true },         // latest from consumer's main branch
  { matchingBranch: true },     // feature branch pair-testing
  { deployedOrReleased: true }, // ALL versions currently deployed/released anywhere
],
enablePending: true,            // new consumer interactions won't break provider CI
publishVerificationResults: process.env.CI === "true",  // only publish in CI
providerVersion: process.env.GIT_COMMIT,
providerVersionBranch: process.env.GIT_BRANCH,
```
Missing `deployedOrReleased: true` is the single most common reason `can-i-deploy` fails — the provider never verifies the version that's actually deployed in production.

**Optional fields** — Pact has no `optional()` or `nullable()` matcher. Use **two separate interactions** differentiated by provider states: one where the field is present, one where it's absent/null.

**Message pacts (Kafka, SQS, SNS) — hexagonal architecture**
Split the code into two layers before writing tests:
- **Adapter** — the Kafka/SQS listener, `@KafkaListener`, `ConsumerRecord` wiring. Pact does NOT test this.
- **Port** — the domain function that receives the deserialized payload. Pact tests THIS directly.

The consumer test calls the Port directly with a Pact-generated message. No Kafka broker needed. See `references/pact-messages.md` for full JS and Java examples.

---

## Other Diagnostic Patterns

**Provider verification fails** → use `contract-testing_review_pact_tests` with `error_messages` populated from the failing test output. Use `contract-testing_get_provider_states` to check whether the required state exists on the provider.

**"Which version is deployed in staging?"** → `contract-testing_get_currently_deployed_versions` with the staging environment UUID.

**"What services depend on this provider?"** → `contract-testing_get_pacticipant_network` to visualise the blast radius.

**Investigating a specific consumer-provider failure in BDCT** → start with `contract-testing_get_bdct_cross_contract_verification_results`, then drill into `contract-testing_get_bdct_consumer_contract_verification_results_by_consumer_version` for the failing pair. See `references/bdct.md`.

---

## Workspace Management

When setting up a new service or onboarding a team:

1. `contract-testing_create_pacticipant` — register the service
2. `contract-testing_patch_pacticipant` — set `mainBranch` (e.g. `main`) so branch-based can-i-deploy works correctly
3. `contract-testing_list_environments` — discover existing environment UUIDs
4. `contract-testing_create_environment` — add new environments if needed

For auditing and observability:

- `contract-testing_get_metrics` — workspace-wide usage statistics
- `contract-testing_get_team_metrics` — per-team breakdown (PactFlow Cloud only)
- `contract-testing_list_integrations` — all consumer-provider pairings

---

## Deployment vs Release

| Scenario                                             | Tool                                                |
| ---------------------------------------------------- | --------------------------------------------------- |
| Traditional service deployed to an environment       | `contract-testing_record_deployment`                |
| Mobile app / library where multiple versions coexist | `contract-testing_record_release`                   |
| Check what's live in an environment                  | `contract-testing_get_currently_deployed_versions`  |
| Check what's supported (mobile/library)              | `contract-testing_get_currently_supported_versions` |

`record-deployment` replaces the previous deployed version in that environment. `record-release` does not — both versions remain "supported" simultaneously.

---

## Tool Naming

All tools in this skill use the `contract-testing_` prefix. When the user is connected to **PactFlow Cloud**, all tools are available. When connected to an **open-source Pact Broker**, only non-Cloud tools are available (AI generation, BDCT, and team metrics require Cloud).
