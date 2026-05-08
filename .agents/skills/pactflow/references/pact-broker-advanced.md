# Pact Broker — Advanced Topics

> Sources: https://docs.pact.io/pact_broker/advanced_topics/consumer_version_selectors.md, https://docs.pact.io/pact_broker/advanced_topics/pending_pacts.md, https://docs.pact.io/pact_broker/advanced_topics/wip_pacts.md, https://docs.pact.io/pact_broker/branches.md, https://docs.pact.io/pact_broker/recording_deployments_and_releases.md, https://docs.pact.io/getting_started/versioning_in_the_pact_broker.md, https://docs.pact.io/pact_broker/webhooks.md

---

## Consumer Version Selectors

Consumer version selectors are the way to configure which pacts the provider verifies. A list of selector objects is provided, allowing flexibility in which pacts to verify.

### Default selectors

The defaults find pacts matching any of:

1. Latest version on the main branch
2. All versions currently deployed
3. All versions currently marked as released

### Selector properties

| Property                   | Description                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `mainBranch: true`         | Latest pact for the configured `mainBranch` of each consumer. Requires consumer has set `mainBranch` property.                           |
| `branch: "<name>"`         | Latest pact from a specific branch of each consumer.                                                                                     |
| `matchingBranch: true`     | Latest pact from any consumer branch with the same name as the current provider branch. Used for coordinated feature branch development. |
| `fallbackBranch: "<name>"` | Fallback if specified `branch` doesn't exist. Discouraged — use two separate selectors instead.                                          |
| `deployedOrReleased: true` | All consumer versions currently deployed OR released and supported in any environment.                                                   |
| `deployed: true`           | All consumer versions currently deployed to any environment.                                                                             |
| `released: true`           | All consumer versions currently released and supported in any environment.                                                               |
| `environment: "<name>"`    | Further qualifies `deployed` or `released` — only versions in a specific environment.                                                    |
| `tag: "<name>"`            | Legacy: consumer versions with a specific tag. Still supported; prefer `branch`.                                                         |
| `latest: true`             | Used with `tag` — returns the latest version with that tag only.                                                                         |
| `consumer: "<name>"`       | Applies a selector to a specific consumer only.                                                                                          |

### Recommended selectors

```json
[
  { "mainBranch": true },
  { "matchingBranch": true },
  { "deployedOrReleased": true }
]
```

- `mainBranch` — verifies the main development line
- `matchingBranch` — supports coordinated feature branch development without config changes
- `deployedOrReleased` — ensures no regression with already-deployed consumers

### Advanced selector examples

```json
// Only for a specific consumer
{ "branch": "feat/new-api", "consumer": "FrontendApp" }

// Branch with fallback
{ "branch": "feat/new-api", "fallbackBranch": "main" }

// Specific environment
{ "deployed": true, "environment": "production" }

// Tag-based (legacy)
{ "tag": "main", "latest": true }
{ "tag": "production", "latest": true }
```

---

## Pending Pacts

> Source: https://docs.pact.io/pact_broker/advanced_topics/pending_pacts.md

### What is it?

Enabling pending pacts ensures the pact verification task **only fails** when a breaking change causes a previously supported pact to fail. Without it, any failing pact (e.g. ones with new consumer features) will cause the provider's build to break.

**tl;dr — enable `enablePending: true` and your provider build only fails when it needs to.**

### Prerequisites

1. Consumer must configure `mainBranch` property on their pacticipant
2. Consumer must set `branch` and `version` when publishing pacts
3. Provider must set `branch` and `version` when verifying pacts
4. Set `enablePending: true` in provider verification configuration

### Why is it needed?

**Without pending pacts**: Consumer publishes a pact with a new, unsupported interaction to `main`. Next time the provider build runs, the verification fails — blocking the provider from deploying, even though the provider is still compatible with the version of the consumer that's actually deployed in production.

**With pending pacts**: The new interaction is marked as "pending" (never successfully verified from the provider's main branch). The provider build continues. A failure in a pending pact is surfaced as a warning, not a blocking failure. Once the provider successfully verifies the interaction, it becomes "not pending" and will break the build if it regresses.

### Pact becomes non-pending when

A pact is considered "pending" for a specific provider branch until the provider branch successfully verifies it. After that, any regression in that branch will break the build.

---

## Work In Progress (WIP) Pacts

> Source: https://docs.pact.io/pact_broker/advanced_topics/wip_pacts.md

### What is it?

WIP pacts is a feature that ensures any **new contracts** are automatically verified in the provider's main pipeline build without requiring configuration changes.

A "work in progress" pact is one that:

- Is the latest for its branch (or tags)
- Does NOT have a successful verification result from the current provider branch (i.e. it's in "pending" state)
- Was not explicitly specified in the consumer version selectors

### How to enable

Set `includeWipPactsSince` to a date from which you want new pacts to be included:

```javascript
// JavaScript
includeWipPactsSince: process.env.GIT_BRANCH === "main" ? "2020-01-01" : undefined,

// Ruby
include_wip_pacts_since ENV['GIT_BRANCH'] == "main" ? "2020-01-01" : nil
```

The date is required to avoid suddenly verifying hundreds of past feature pacts all at once.

Also requires `providerVersionBranch` (or `providerVersionTags`) to be set.

**Best practice**: Only enable WIP pacts on the provider's main branch. On feature branches, you typically want specific failures to block the build.

### How it works (simplified)

1. Find all pacts that are the latest for their branch ("head" pacts)
2. Discard pacts that have already been successfully verified from the provider's main branch
3. Discard pacts that are explicitly included in the consumer version selectors
4. The remaining pacts are the WIP pacts

Because WIP pacts are in "pending" state, they don't break the build (but failures are reported as warnings).

---

## Branches

> Source: https://docs.pact.io/pact_broker/branches.md

From Pact Broker v2.82.0, branches are a first-class concept. They supersede tags for tracking branches.

### Configuring the branch when publishing pacts

Always set the branch when publishing:

```bash
pact-broker publish ./pacts \
  --pacticipant YourConsumer \
  --version $GIT_COMMIT \
  --branch $GIT_BRANCH
```

Or via MCP:

```
contract-testing_publish_consumer_contracts
  pacticipantName: "YourConsumer"
  pacticipantVersionNumber: "<git-sha>"
  branch: "<git-branch>"
  contracts: [...]
```

### Configuring the main branch

Each pacticipant should have a `mainBranch` property configured. This is what the `{ mainBranch: true }` selector uses:

```
contract-testing_patch_pacticipant
  pacticipantName: "YourConsumer"
  mainBranch: "main"
```

### Branch lifecycle

- Branches are created automatically when pacts are published with a branch name
- Clean up stale feature branches after merge: `contract-testing_delete_branch`
- The latest version for a branch is the most recently published version

---

## Recording Deployments and Releases

> Source: https://docs.pact.io/pact_broker/recording_deployments_and_releases.md

The Pact Broker needs to know which versions of each application are in each environment to return correct pacts for verification and to determine safe deployments.

### record-deployment vs record-release

|                          | `record-deployment`                                                         | `record-release`                                       |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| Use for                  | APIs and consumer apps deployed to known instances                          | Mobile apps, libraries, distributed artifacts          |
| Behaviour                | Marks previous version as **undeployed** automatically                      | Does NOT change status of previously released versions |
| Multiple versions in env | No — only one version deployed at a time (or one per `applicationInstance`) | Yes — multiple versions coexist simultaneously         |
| MCP tool                 | `contract-testing_record_deployment`                                        | `contract-testing_record_release`                      |

### Recording a deployment

```
contract-testing_record_deployment
  pacticipantName: "OrderService"
  versionNumber: "abc1234"
  environmentId: "<uuid-of-production>"
  applicationInstance: "blue"  # optional, for blue/green deployments
```

### Recording a release

```
contract-testing_record_release
  pacticipantName: "MobileApp"
  versionNumber: "3.2.1"
  environmentId: "<uuid-of-production>"
```

### Getting the environment UUID

```
contract-testing_list_environments
# Returns all environments with their UUIDs
```

### Migrating from tags to environments

Tags used for environments (e.g. `pact-broker create-version-tag --tag production`) are still supported but superseded by `record-deployment`. New features may not support tags. Migrate when possible:

1. Create named environments: `contract-testing_create_environment`
2. Replace `create-version-tag --tag production` with `contract-testing_record_deployment`
3. Replace `{ tag: "production", latest: true }` selectors with `{ deployedOrReleased: true }`

---

## Versioning in the Pact Broker

> Source: https://docs.pact.io/getting_started/versioning_in_the_pact_broker.md

### Best practices for version numbers

- **Use the git SHA** as the version number — it's unambiguous and always available in CI
- Do NOT use a version number that can be re-used across builds (e.g. `1.0.0-SNAPSHOT`)
- Do NOT use random data in pacts — a new pact row is only created when pact content changes

```bash
# Good: unique, reproducible
VERSION=$(git rev-parse HEAD)

# Bad: can be overwritten
VERSION=1.0.0-SNAPSHOT
```

### Pact content versioning

The Pact Broker versions pact **content** separately from application versions. A new database row for pact content is only created when the pact content changes. Publishing the same pact content with a new version number doesn't create a new pact — it associates the existing pact with the new version.

---

## Webhooks

> Source: https://docs.pact.io/pact_broker/webhooks.md

Webhooks allow you to trigger actions (typically CI builds) when events occur in the Pact Broker.

### Key events

| Event                                                              | When triggered                                                      | Typical use                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------- |
| `contract_published`                                               | A pact is published for the first time, or when its content changes | Trigger provider verification                             |
| `contract_requiring_verification_published`                        | A pact is published and needs verification                          | **Recommended** — trigger provider build passing pact URL |
| `verification_published`                                           | A provider publishes a verification result                          | Trigger consumer build to check can-i-deploy              |
| `provider_verification_succeeded` / `provider_verification_failed` | After verification                                                  | Trigger consumer build with success/failure               |

### Using the `contract_requiring_verification_published` event

This is the most important webhook for an efficient CI/CD workflow. When a consumer publishes a changed pact, this event triggers the provider build, passing the pact URL as a parameter. The provider can then verify just the changed pact without reconfiguring selectors.

### Dynamic variable substitution in webhook bodies

```
${pactbroker.consumerName}
${pactbroker.providerName}
${pactbroker.pactUrl}
${pactbroker.verificationResultUrl}
${pactbroker.consumerVersionNumber}
${pactbroker.providerVersionNumber}
${pactbroker.consumerVersionTags}
${pactbroker.consumerVersionBranch}
${pactbroker.providerVersionBranch}
```

### Managing webhooks via MCP

```
# Create a webhook
contract-testing_create_webhook
  description: "Trigger provider CI when pact changes"
  events: ["contract_requiring_verification_published"]
  consumer: "FrontendApp"    # optional: scope to specific consumer
  provider: "UserService"    # optional: scope to specific provider
  request:
    method: "POST"
    url: "https://api.github.com/repos/example/provider/actions/workflows/pact.yml/dispatches"
    headers: { "Authorization": "Bearer ${pactbroker.githubToken}" }
    body: { "ref": "main", "inputs": { "pact_url": "${pactbroker.pactUrl}" } }

# Test a webhook
contract-testing_execute_webhook
  uuid: "<webhook-uuid>"
```

### Webhook template library

See https://docs.pact.io/pact_broker/webhooks/template_library for ready-made templates for:

- GitHub Actions
- CircleCI
- GitLab CI
- Jenkins
- Travis CI
- Azure DevOps
