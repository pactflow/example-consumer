# Pact Broker Setup, CLI & Troubleshooting

> Sources: https://docs.pact.io/pact_broker/set_up_checklist.md, https://docs.pact.io/pact_broker/client_cli/readme.md, https://docs.pact.io/pact_broker/webhooks/debugging_webhooks.md, https://docs.pact.io/pact_broker/webhooks/dynamic_variable_sub.md, https://docs.pact.io/pact_broker/advanced_topics/troubleshooting.md

---

## Setup Checklist

### Basic Setup (get pacts generated and verified automatically)

**Anyone:**

- Set up a [Pact Broker](https://github.com/pact-foundation/pact_broker) instance, or create a [PactFlow](https://pactflow.io/pricing/) account

**Consumer team:**

- Write consumer tests using the Pact mock provider (generates pact files)
- Publish pacts to the broker in CI with a branch tag (`main`, `feat-foo`)
- Use the git SHA as the version number

**Provider team:**

- Add a pact verification test to CI
- Configure verification to verify pacts from the consumer's `main` branch
- Only publish verification results from CI (not local)
- Create a separate CI job that just verifies a specific pact URL (for webhook-triggered builds)
- Create a webhook that triggers that job when a pact changes (pass the pact URL via webhook template)

### Advanced Setup (safe independent deployments)

**Consumer team:**

- Record deployments: tag the version in the broker when deploying to each environment
- Add `can-i-deploy` check before deploying

**Provider team:**

- Also verify pacts from the production environment (`{ deployed: true, environment: "production" }`)
- Record deployments: tag the provider version when deploying to each environment
- Add `can-i-deploy` check before deploying

### Super Advanced (when can-i-deploy fails due to missing production verification)

If `can-i-deploy` fails because you've never verified the production provider version against the new consumer version:

1. Deploy the latest provider version to production (recommended)
2. OR check out the production provider version and run verification against the failing consumer pact

Find the production provider version:

```bash
pact-broker describe-version --pacticipant MyProvider --latest production
```

---

## Pact Broker CLI Reference

### Installation

```bash
# Docker (no Ruby required)
docker pull pactfoundation/pact-cli:latest

# Standalone binary (no Ruby required)
# Download from: https://github.com/pact-foundation/pact-ruby-standalone/releases

# Ruby gem
gem install pact_broker-client
```

### Authentication

Set one of these (or pass as flags):

```bash
# Bearer token (PactFlow)
export PACT_BROKER_BASE_URL="https://yourorg.pactflow.io"
export PACT_BROKER_TOKEN="your-api-token"

# Basic auth (open-source Pact Broker)
export PACT_BROKER_BASE_URL="https://your-broker.example.com"
export PACT_BROKER_USERNAME="admin"
export PACT_BROKER_PASSWORD="password"
```

---

### Publishing Pacts

```bash
pact-broker publish ./pacts \
  --consumer-app-version $GIT_COMMIT \
  --branch $GIT_BRANCH \
  --broker-base-url $PACT_BROKER_BASE_URL
```

Options:

- `-a` / `--consumer-app-version` — version number (use git SHA)
- `-h` / `--branch` — git branch name
- `-t` / `--tag` — legacy tag (prefer branch)
- `--merge` — merge with existing pact content (for parallel consumer builds)
- `--build-url` — CI build URL for traceability

---

### Environments

```bash
# List all environments
pact-broker list-environments

# Create an environment
pact-broker create-environment \
  --name production \
  --display-name "Production" \
  --production   # marks it as a production environment

# Create a staging environment
pact-broker create-environment --name staging --display-name "Staging"

# Describe an environment
pact-broker describe-environment --uuid <uuid>

# Delete an environment
pact-broker delete-environment --uuid <uuid>
```

---

### Recording Deployments and Releases

```bash
# Record a deployment (replaces previous deployed version)
pact-broker record-deployment \
  --pacticipant MyApp \
  --version $GIT_COMMIT \
  --environment production

# Record undeployment (only needed when permanently removing from environment)
pact-broker record-undeployment \
  --pacticipant MyApp \
  --environment production

# Record a release (mobile/library — multiple versions coexist)
pact-broker record-release \
  --pacticipant MyMobileApp \
  --version $VERSION \
  --environment production

# End support for a released version
pact-broker record-support-ended \
  --pacticipant MyMobileApp \
  --version $OLD_VERSION \
  --environment production
```

---

### can-i-deploy

```bash
# Basic check
pact-broker can-i-deploy \
  --pacticipant MyApp \
  --version $GIT_COMMIT \
  --to-environment production

# With polling (wait for verification results)
pact-broker can-i-deploy \
  --pacticipant MyApp \
  --version $GIT_COMMIT \
  --to-environment production \
  --retry-while-unknown 10 \
  --retry-interval 10

# Dry run (always exits 0 — use to validate setup)
pact-broker can-i-deploy \
  --pacticipant MyApp \
  --version $GIT_COMMIT \
  --to-environment production \
  --dry-run

# Check by branch (not version)
pact-broker can-i-deploy \
  --pacticipant MyApp \
  --branch main \
  --to-environment staging

# Check using the latest of the configured main branch
pact-broker can-i-deploy \
  --pacticipant MyApp \
  --main-branch \
  --to-environment staging
```

**can-i-merge**: Checks if the specified version is compatible with the main branch of each integrated application (useful before merging a PR):

```bash
pact-broker can-i-merge --pacticipant MyApp --version $GIT_COMMIT
```

---

### Pacticipants

```bash
# Create or update a pacticipant
pact-broker create-or-update-pacticipant \
  --name MyService \
  --display-name "My Service" \
  --main-branch main \
  --repository-url https://github.com/myorg/my-service

# List all pacticipants
pact-broker list-pacticipants

# Describe a pacticipant
pact-broker describe-pacticipant --name MyService
```

---

### Webhooks

```bash
# Create a webhook (tip: build curl command first, then adapt)
pact-broker create-webhook \
  "https://ci.example.com/api/builds" \
  --request POST \
  --header "Content-Type: application/json" \
  --data '{"pact_url": "${pactbroker.pactUrl}", "branch": "${pactbroker.consumerVersionBranch}"}' \
  --consumer FrontendApp \
  --provider UserService \
  --contract-requiring-verification-published \
  --description "Trigger UserService build when FrontendApp pact changes"

# Test a webhook
pact-broker test-webhook --uuid <webhook-uuid>

# Create-or-update webhook (idempotent, good for infrastructure-as-code)
pact-broker generate-uuid  # generate a UUID first
pact-broker create-or-update-webhook \
  "https://ci.example.com/api/builds" \
  --uuid <generated-uuid> \
  --request POST \
  ...
```

**Webhook event flags**:

- `--contract-content-changed` — pact published with changed content
- `--contract-published` — pact published for the first time
- `--contract-requiring-verification-published` — pact needs verification (recommended)
- `--provider-verification-published` — verification result published
- `--provider-verification-failed` — verification failed
- `--provider-verification-succeeded` — verification succeeded

---

### Branches and Tags

```bash
# Delete a stale feature branch (does not delete pacts, just the branch record)
pact-broker delete-branch --branch feat/old-feature --pacticipant MyConsumer

# Create a version tag (legacy)
pact-broker create-version-tag \
  --pacticipant MyConsumer \
  --version $GIT_COMMIT \
  --tag production
```

---

### Versions

```bash
# Describe the latest version of a pacticipant
pact-broker describe-version --pacticipant MyService

# Describe a specific version
pact-broker describe-version --pacticipant MyService --version $GIT_COMMIT

# Describe latest version with a specific tag
pact-broker describe-version --pacticipant MyService --latest production
```

---

### PactFlow-only: Publishing Provider Contracts (BDCT)

```bash
pactflow publish-provider-contract openapi.yaml \
  --provider MyProvider \
  --provider-app-version $GIT_COMMIT \
  --branch $GIT_BRANCH \
  --specification oas \
  --content-type application/yaml \
  --verification-success \
  --verifier dredd \
  --verifier-version 13.0.0
```

See `references/bdct.md` for full BDCT workflow.

---

## Webhook Debugging

### Why didn't my webhook fire?

Search application logs for the consumer version number. Look for lines like:

- `"Pact content has not changed since previous version, not triggering webhooks"` — no change in pact content, so webhook didn't fire (by design)
- `"No enabled webhooks found for consumer X and provider Y"` — no webhook configured for this pair
- `"Webhook triggered for the following reasons: ..."` — webhook did fire, check the scheduling logs
- `"Scheduling job for webhook with uuid ..."` — webhook is queued

Set `PACT_BROKER_LOG_LEVEL=DEBUG` and `PACT_BROKER_SQL_LOG_LEVEL=none` to see more detail.

### Testing a webhook manually

**PactFlow**: Settings → Webhooks → select webhook → Edit → scroll down → TEST button

**Open-source Pact Broker**:

1. Go to `/webhooks` in the API Browser
2. Navigate to the webhook via `pb:webhooks` relation
3. Click `NON-GET` on the `pb:execute` relation → Make Request
4. Execution logs are returned on the next page

### Viewing past webhook execution logs

1. On the Pact Broker index page, the second-to-last column shows webhook status per pact
2. Click the link to get the webhook status resource
3. If there's an error: look for `pb:error-logs` relation in the Links section

**Note**: Execution logs are hidden by default for security. Configure `PACT_BROKER_WEBHOOK_HOST_WHITELIST` or `webhook_host_whitelist` to enable viewing logs from specific hosts.

### Creating webhooks — best practice

1. Get the API call working first with `curl` or Postman
2. Use the curl command to create the webhook with `pact-broker create-webhook`
3. For credentials: store in PactFlow Secrets (Settings → Secrets) and reference via `${pactbroker.secretName}`

---

## Webhook Dynamic Variable Substitution

The following `${pactbroker.*}` variables can be used in webhook request paths, parameters, and bodies:

| Variable                                    | Value                                               |
| ------------------------------------------- | --------------------------------------------------- |
| `${pactbroker.consumerName}`                | Consumer name                                       |
| `${pactbroker.providerName}`                | Provider name                                       |
| `${pactbroker.consumerVersionNumber}`       | Consumer version number                             |
| `${pactbroker.providerVersionNumber}`       | Provider version number (verification result)       |
| `${pactbroker.consumerVersionTags}`         | Consumer version tags, comma-separated              |
| `${pactbroker.providerVersionTags}`         | Provider version tags, comma-separated              |
| `${pactbroker.consumerVersionBranch}`       | Consumer version branch name                        |
| `${pactbroker.providerVersionBranch}`       | Provider version branch name                        |
| `${pactbroker.consumerLabels}`              | Consumer labels, comma-separated                    |
| `${pactbroker.providerLabels}`              | Provider labels, comma-separated                    |
| `${pactbroker.pactUrl}`                     | Permalink URL to the published pact                 |
| `${pactbroker.verificationResultUrl}`       | URL to the verification result                      |
| `${pactbroker.githubVerificationStatus}`    | Verification status for GitHub commit status API    |
| `${pactbroker.bitbucketVerificationStatus}` | Verification status for Bitbucket commit status API |

### Example webhook body

```json
{
  "events": [{ "name": "contract_requiring_verification_published" }],
  "request": {
    "method": "POST",
    "url": "https://api.github.com/repos/myorg/provider/actions/workflows/pact.yml/dispatches",
    "headers": {
      "Authorization": "Bearer ${pactbroker.githubToken}",
      "Content-Type": "application/json"
    },
    "body": {
      "ref": "main",
      "inputs": {
        "pact_url": "${pactbroker.pactUrl}",
        "consumer_version_branch": "${pactbroker.consumerVersionBranch}"
      }
    }
  }
}
```

For pre-built webhook templates (GitHub Actions, CircleCI, GitLab, Jenkins, Azure DevOps), see: https://docs.pact.io/pact_broker/webhooks/template_library

---

## Troubleshooting

### 409 Conflict When Publishing a Pact

The Pact Broker prevents creating pacticipants with similar names (e.g. `FooBar` vs `foo-bar` vs `foo bar`).

**Fix**: Manually create the pacticipant with the exact desired name:

```bash
pact-broker create-or-update-pacticipant --name "ExactServiceName"
```

Or via the MCP tool:

```
contract-testing_create_pacticipant
  name: "ExactServiceName"
```

To disable the duplicate checking: set `PACT_BROKER_CHECK_FOR_POTENTIAL_DUPLICATE_PACTICIPANT_NAMES=false` (not recommended).

### `schema_migrations does not exist` on Startup

This is **not an error**. The Pact Broker checks if tables exist by attempting to query them — if they don't exist yet, it logs an error but then creates them. This is expected behavior on first startup and can be safely ignored.

### `can-i-deploy` returns error for unknown application

If your org has a universal CI pipeline and some apps don't use Pact, wrap `can-i-deploy`:

```bash
pact-broker can-i-deploy \
  --pacticipant $APP \
  --version $VERSION \
  --to-environment production \
  --dry-run  # always exits 0 while setting up
```

Or use logic to skip when the app isn't in the broker:

```bash
pact-broker can-i-deploy ... || echo "Not in Pact Broker — skipping"
```

### Pact verification not publishing results

Common causes:

1. `publishVerificationResult` / `publish_verification_results` is `false` or only set in CI
2. Provider version or branch not set (required for result association)
3. Pact Broker URL/token is incorrect

Verify the provider version is set:

```bash
# Should be your git SHA
echo $GIT_COMMIT
```
