# PactFlow MCP Tools Reference

All tools use the `contract-testing_` prefix. Tools marked **Cloud only** require PactFlow Cloud (`PACT_BROKER_TOKEN`). All others work with both PactFlow and open-source Pact Broker.

## Table of Contents

1. [AI Tools](#ai-tools) (Cloud only)
2. [Deployment Safety](#deployment-safety)
3. [Contracts](#contracts)
4. [Pacticipants](#pacticipants)
5. [Branches & Versions](#branches--versions)
6. [Environments & Deployments](#environments--deployments)
7. [Bi-Directional Contract Testing](#bi-directional-contract-testing) (Cloud only)
8. [Integrations & Network](#integrations--network)
9. [Labels](#labels)
10. [Metrics](#metrics)
11. [Webhooks](#webhooks)
12. [Secrets](#secrets)

---

## AI Tools

**`contract-testing_generate_pact_tests`** ☁️ Cloud only
Generate Pact tests using PactFlow AI.

- `language` — target language (inferred if omitted and code files provided)
- `request_response.request` / `.response` — HTTP interaction to generate from
- `code` — array of code files (client code, models, utilities)
- `openapi.document` — OpenAPI spec content; `openapi.matcher` — filter to specific endpoint/method/status
- `openapi.remoteDocument` — URL + auth for a remote OpenAPI spec
- `additional_instructions` — extra constraints or framework preferences
- `test_template` — existing test file to use as a structural template

**`contract-testing_review_pact_tests`** ☁️ Cloud only
Review existing Pact tests against best practices.

- `pact_tests` — the test files to review (required)
- `code` — supporting code files for context
- `openapi.document` / `.matcher` / `.remoteDocument` — API spec context
- `user_instructions` — areas to focus on
- `error_messages` — output from failed test runs to help diagnose issues

**`contract-testing_check_pactflow_ai_entitlements`** ☁️ Cloud only
Diagnose 401 errors or credit issues when using AI tools. No parameters.

---

## Deployment Safety

**`contract-testing_can_i_deploy`**
Check whether a version is safe to deploy to an environment.

- `pacticipant` — service name (required)
- `version` — version number (required)
- `environment` — target environment name, e.g. `production` (required)

**`contract-testing_matrix`**
Query the contract verification matrix.

- `q` — array of 1–2 pacticipant selectors, each with: `pacticipant`, and one of `version`, `branch`, `environment`, `latest`, `tag`, `mainBranch`
- `latestby` — `cvp` (latest per consumer version + provider) or `cvpv` (latest per consumer version + provider version)
- `limit` — max rows (1–1000, default 100)

---

## Contracts

**`contract-testing_publish_consumer_contracts`**
Publish consumer pact files to the broker.

- `pacticipantName`, `pacticipantVersionNumber` — consumer name and version (required)
- `contracts` — array of `{ consumerName, providerName, content (base64), contentType: "application/json", specification: "pact" }`
- `branch` — consumer branch name
- `tags` — version tags array
- `buildUrl` — CI build URL

**`contract-testing_publish_provider_contract`** ☁️ Cloud only (BDCT)
Publish an OpenAPI spec + self-verification results.

- `providerName`, `pacticipantVersionNumber` — required
- `contract.content` — base64-encoded OpenAPI spec
- `contract.contentType` — `application/yaml`, `application/json`, or `application/yml`
- `contract.specification` — must be `oas`
- `contract.selfVerificationResults.success` — boolean (required)
- `contract.selfVerificationResults.verifier` — tool name, e.g. `dredd`, `schemathesis`
- `branch`, `tags`, `buildUrl` — optional metadata

**`contract-testing_get_pacts_for_verification`**
Fetch pacts a provider should verify in its CI run.

- `providerName` — required
- `consumerVersionSelectors` — array of selectors: `{ mainBranch: true }`, `{ deployedOrReleased: true }`, `{ branch: "feat/x" }`, `{ environment: "staging" }`
- `includePendingStatus` — boolean; pending pacts won't fail the provider build
- `includeWipPactsSince` — ISO 8601 date; include new consumer interactions for early feedback
- `providerVersionBranch`, `providerVersionTags` — metadata about the provider being verified

**`contract-testing_get_provider_states`**
List all provider states defined for a provider.

- `provider` — provider name (required)

---

## Pacticipants

**`contract-testing_list_pacticipants`**
List all registered services. Optional: `pageNumber`, `pageSize`.

**`contract-testing_get_pacticipant`**
Get metadata for a service. `pacticipantName` required.

**`contract-testing_create_pacticipant`**
Register a new service. `name` required. Optional: `displayName`, `mainBranch`, `repositoryUrl`, `repositoryName`, `repositoryNamespace`.

**`contract-testing_update_pacticipant`**
Fully replace pacticipant metadata (clears unset fields). Same params as create plus `pacticipantName`.

**`contract-testing_patch_pacticipant`**
Partially update pacticipant metadata (only provided fields change). Prefer over update for targeted changes.

**`contract-testing_delete_pacticipant`**
Delete a service and all its data. `pacticipantName` required. Irreversible.

---

## Branches & Versions

**`contract-testing_list_branches`**
List branches for a pacticipant. `pacticipantName` required. Optional: `q` (name filter), `pageNumber`, `pageSize`.

**`contract-testing_get_branch`**
Get branch metadata. `pacticipantName`, `branchName` required.

**`contract-testing_delete_branch`**
Delete a branch and its version associations. `pacticipantName`, `branchName` required.

**`contract-testing_get_branch_versions`**
List versions published from a branch. `pacticipantName`, `branchName` required. Optional: `pageNumber`, `pageSize`.

**`contract-testing_list_pacticipant_versions`**
List all versions for a service. `pacticipantName` required. Optional: `pageNumber`, `pageSize`.

**`contract-testing_get_pacticipant_version`**
Get metadata for a specific version. `pacticipantName`, `versionNumber` required.

**`contract-testing_get_latest_pacticipant_version`**
Get the most recent version, optionally filtered by tag. `pacticipantName` required. Optional: `tag`.

**`contract-testing_update_pacticipant_version`**
Update version metadata. `pacticipantName`, `versionNumber` required. Optional: `buildUrl`.

**`contract-testing_get_deployed_versions_for_version`**
Check deployment records for a version in an environment. `pacticipantName`, `versionNumber`, `environmentId` required.

**`contract-testing_get_released_versions_for_version`**
Check release records for a version in an environment (mobile/library workflows). Same params.

---

## Environments & Deployments

**`contract-testing_list_environments`**
List all environments and their UUIDs. No parameters.

**`contract-testing_get_environment`**
Get environment details. `environmentId` (UUID) required.

**`contract-testing_create_environment`**
Create an environment. `name` required. Optional: `displayName`, `production` (boolean).

**`contract-testing_update_environment`**
Replace environment config. `environmentId`, `name` required. Optional: `displayName`, `production`.

**`contract-testing_delete_environment`**
Delete an environment. `environmentId` required. Also removes all deployment/release records.

**`contract-testing_record_deployment`**
Record a deployment. `pacticipantName`, `versionNumber`, `environmentId` required. Optional: `applicationInstance` (e.g. `blue`, `green`).

**`contract-testing_get_currently_deployed_versions`**
List currently deployed versions in an environment. `environmentId` required.

**`contract-testing_record_release`**
Record a release (mobile/library). `pacticipantName`, `versionNumber`, `environmentId` required.

**`contract-testing_get_currently_supported_versions`**
List currently supported (released) versions in an environment. `environmentId` required.

---

## Bi-Directional Contract Testing

All BDCT tools are **Cloud only**. See `bdct.md` for patterns and investigation workflows.

**`contract-testing_get_bdct_provider_contract`**
Fetch the published OpenAPI spec for a provider version.
`providerName`, `providerVersionNumber` required.

**`contract-testing_get_bdct_provider_contract_verification_results`**
Fetch self-verification results (Dredd, Schemathesis, etc.) for a provider version.
`providerName`, `providerVersionNumber` required.

**`contract-testing_get_bdct_consumer_contracts`**
Fetch all consumer pacts compared against a provider version.
`providerName`, `providerVersionNumber` required.

**`contract-testing_get_bdct_consumer_contract_verification_results`**
Fetch results of comparing all consumer pacts against the provider's OpenAPI spec.
`providerName`, `providerVersionNumber` required.

**`contract-testing_get_bdct_cross_contract_verification_results`**
Fetch the combined cross-contract comparison result — the key result for can-i-deploy.
`providerName`, `providerVersionNumber` required.

**By consumer version** (add `consumerName`, `consumerVersionNumber` to any of the above):

- `contract-testing_get_bdct_consumer_contract_by_consumer_version`
- `contract-testing_get_bdct_provider_contract_by_consumer_version`
- `contract-testing_get_bdct_provider_contract_verification_results_by_consumer_version`
- `contract-testing_get_bdct_consumer_contract_verification_results_by_consumer_version`
- `contract-testing_get_bdct_cross_contract_verification_results_by_consumer_version`

---

## Integrations & Network

**`contract-testing_list_integrations`**
List all consumer-provider pairings in the workspace. No parameters.

**`contract-testing_get_pacticipant_network`**
Get the integration graph for a service — all consumers that depend on it, and all providers it depends on. `pacticipantName` required. Useful for blast radius analysis.

---

## Labels

**`contract-testing_list_labels`**
List all labels used across the workspace. Optional: `pageNumber`, `pageSize`.

**`contract-testing_get_pacticipant_label`**
Check if a label is applied to a pacticipant. `pacticipantName`, `label` required. Returns 404 if not applied.

**`contract-testing_list_pacticipants_by_label`**
List all services with a given label. `label` required.

**`contract-testing_add_label`**
Apply a label to a pacticipant. `pacticipantName`, `label` required.

**`contract-testing_remove_label`**
Remove a label from a pacticipant. `pacticipantName`, `label` required.

---

## Metrics

**`contract-testing_get_metrics`**
Workspace-wide usage statistics. No parameters.

**`contract-testing_get_team_metrics`** ☁️ Cloud only
Per-team usage statistics. No parameters.

---

## Webhooks

**`contract-testing_list_webhooks`** / **`contract-testing_get_webhook`**
List or get webhook configurations. `uuid` required for get.

**`contract-testing_create_webhook`** / **`contract-testing_update_webhook`**
Create or update a webhook. Key fields: `description`, `events` (array), `request` (method, url, headers, body), optionally scoped to `consumer`, `provider`.

**`contract-testing_delete_webhook`**
Delete a webhook. `uuid` required.

**`contract-testing_execute_webhook`**
Trigger a webhook manually for testing. `uuid` required.

---

## Secrets

**`contract-testing_list_secrets`** / **`contract-testing_get_secret`**
List or get secrets (used in webhook configurations). `uuid` required for get.

**`contract-testing_create_secret`** / **`contract-testing_update_secret`**
Create or update a secret. `name`, `value` required.

**`contract-testing_delete_secret`**
Delete a secret. `uuid` required.
