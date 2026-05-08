# Pact CI/CD Setup Guide — Pact Nirvana

> Sources: https://docs.pact.io/pact_nirvana.md, https://docs.pact.io/pact_broker/can_i_deploy.md, steps 1–7

This guide covers the progressive steps to a full contract testing CI/CD pipeline that enables **independent deployments** with confidence.

---

## The Goal

By the end of this setup, you will have a release pipeline that allows you to independently deploy any application with the confidence that it will work correctly with the other applications in its environment — without running a suite of end-to-end tests.

---

## Step 1: Learn About Pact (Bronze Prep)

Before starting, every team member involved should understand:

- [How Pact works](https://docs.pact.io/getting_started/how_pact_works)
- [Consumer best practices](https://docs.pact.io/consumer)
- [Provider best practices](https://docs.pact.io/provider)
- [Pact Nirvana progression](https://docs.pact.io/pact_nirvana)

---

## Step 2: Get Team Alignment

Contract tests are only valuable if the provider verifies them. Before writing tests:

- **Consumer team**: Explain what you want to test and why. Share the pact with the provider team before they implement it.
- **Provider team**: Commit to running pact verification in CI. Agree on provider state naming conventions.
- **Both teams**: Agree on a shared Pact Broker/PactFlow instance. Discuss the deployment workflow — branches, environments, webhooks.

Contract tests require **coordination** — a consumer test with no provider verification is useless.

---

## Step 3: Bronze — Single Test Working Manually

Goal: Get the consumer-provider contract testing working locally.

**Consumer side**:

1. Write a Pact test for the first interaction
2. Run the test → generates a `pact.json` file
3. Share the pact file with the provider (copy to provider's pacts directory)

**Provider side**:

1. Write a provider state handler for each state referenced in the pact
2. Run pact verification pointing at the local pact file
3. Fix any failures

**Do not** try to automate or integrate with CI yet. Just make it work manually first.

---

## Step 4: Silver — Integrate with Pact Broker

Goal: Automate pact sharing via the Pact Broker.

**Consumer CI**:

1. Run consumer tests → generate pact file
2. Publish pact to broker with version and branch:
   ```
   contract-testing_publish_consumer_contracts
     pacticipantName: "FrontendApp"
     pacticipantVersionNumber: "$GIT_SHA"
     branch: "$GIT_BRANCH"
     contracts: [...]
   ```

**Provider CI**:

1. Fetch pacts from broker using consumer version selectors:
   ```
   contract-testing_get_pacts_for_verification
     providerName: "UserService"
     consumerVersionSelectors: [{ mainBranch: true }]
   ```
2. Run verification against the fetched pacts
3. Publish verification results back to broker (done automatically by the Pact library)

At this stage: no can-i-deploy yet, no deployment recording. Just exchange pacts and verification results.

---

## Step 5: Gold — Integrate with PR Pipelines

Goal: Pact tests run automatically on every PR/commit.

**Consumer PR pipeline**:

1. Run consumer tests
2. Publish pact to broker (with current branch)

**Provider PR pipeline**:

1. Fetch pacts for verification (with `matchingBranch: true` in selectors to pick up feature branches)
2. Run verification
3. Publish verification results

```javascript
consumerVersionSelectors: [
  { mainBranch: true },
  { matchingBranch: true }, // picks up consumer feature branches
];
```

Enable `enablePending: true` to prevent consumer changes from breaking the provider build unexpectedly.

---

## Step 6: Platinum — can-i-deploy with Branch Pipelines

Goal: Use can-i-deploy as a deployment gate. Trigger provider builds when pacts change.

### Set up environments

```
contract-testing_list_environments  # check existing environments
contract-testing_create_environment
  name: "production"
  displayName: "Production"
  production: true
```

### Add can-i-deploy before deploying

In each service's deploy script:

```
contract-testing_can_i_deploy
  pacticipant: "FrontendApp"
  version: "$GIT_SHA"
  environment: "production"
```

If it returns success (exit 0), proceed to deploy. If failure, stop and investigate.

### Record deployment after deploying

```
contract-testing_record_deployment
  pacticipantName: "FrontendApp"
  versionNumber: "$GIT_SHA"
  environmentId: "<uuid-of-production>"
```

### Add a webhook to trigger provider builds

Set up a `contract_requiring_verification_published` webhook:

```
contract-testing_create_webhook
  description: "Trigger UserService build when FrontendApp pact changes"
  events: ["contract_requiring_verification_published"]
  consumer: "FrontendApp"
  provider: "UserService"
  request:
    method: "POST"
    url: "https://ci.example.com/api/builds"
    body:
      pact_url: "${pactbroker.pactUrl}"
      branch: "${pactbroker.consumerVersionBranch}"
```

### Add a new provider verification job (webhook-driven)

Add a separate provider CI job that:

1. Receives the pact URL from the webhook
2. Verifies just that pact URL (no selectors needed):
   ```javascript
   pactUrls: [process.env.PACT_URL];
   ```
3. Publishes verification results

This gives fast feedback to the consumer team without waiting for the full provider regression suite.

### Update consumer version selectors to include deployed versions

```javascript
consumerVersionSelectors: [
  { mainBranch: true },
  { matchingBranch: true },
  { deployedOrReleased: true }, // add this once you're recording deployments
];
```

---

## Step 7: Diamond — Independent Deployments

Goal: Full independent deployments. Consumer and provider deploy at their own pace with confidence.

At this stage, your pipeline automatically:

1. Runs consumer tests on PR → publishes pact
2. Triggers provider build via webhook → verifies pact → publishes results
3. Consumer sees verification results in the Pact Broker before merging
4. Before any deploy: `can-i-deploy` checks compatibility with all deployed versions
5. After deploy: `record-deployment` updates the broker

**The Diamond level advantage**: You can now verify that your new consumer version is compatible with the **production version** of the provider (via `{ deployedOrReleased: true }` selector), not just the head version. This is what enables true independent deployments.

---

## Can I Deploy — Deep Dive

> Source: https://docs.pact.io/pact_broker/can_i_deploy.md

### The Pact Matrix

The Matrix is a table of all consumer and provider versions that have been tested against each other, with verification results:

| Foo version (consumer) | Bar version (provider) | Success? |
| ---------------------- | ---------------------- | -------- |
| 22                     | 56 (production)        | true     |
| 23                     | 56 (production)        | true     |
| 24                     | 58                     | true     |
| 25                     | 58                     | false    |

can-i-deploy queries this matrix. If Bar v56 is in production and we want to deploy Foo v23 → check matrix → v23 and v56 were verified successfully → safe to deploy.

### CLI usage

```bash
# Check (before deploying)
pact-broker can-i-deploy \
  --pacticipant Foo \
  --version 23 \
  --to-environment production \
  --broker-base-url $PACT_BROKER_BASE_URL

# Record (after deploying)
pact-broker record-deployment \
  --pacticipant Foo \
  --version 23 \
  --environment production \
  --broker-base-url $PACT_BROKER_BASE_URL
```

Exit code 0 = safe to deploy. Exit code 1 = NOT safe.

### MCP tool

```
contract-testing_can_i_deploy
  pacticipant: "Foo"
  version: "23"
  environment: "production"
```

### Advanced can-i-deploy features

- **Polling**: Wait for verification results to be published (useful when waiting for a webhook-triggered provider build)
- **Ignoring integrations**: `--ignore PROVIDER` skips a new provider that hasn't set up verification yet
- **Dry run**: `--dry-run` shows results but always exits 0 — use to validate pipeline setup before enabling the check

### Using can-i-deploy with tags (legacy)

If not yet using environments:

```bash
pact-broker can-i-deploy \
  --pacticipant Foo \
  --version 173153ae0 \
  --to production  # tag-based
```

For mobile providers with multiple versions in production:

```bash
pact-broker can-i-deploy \
  --pacticipant Bar --version b80e7b1b \
  --pacticipant Foo --all prod \
  --to prod
```

---

## Universal CI/CD Pipeline Considerations

> Source: https://docs.pact.io/pact_nirvana/notes_1.md

If your organisation has a standard CI/CD pipeline used by all projects, and only some projects use Pact:

**Problem**: `can-i-deploy` returns an error if you try to deploy an application version it doesn't know about.

**Solution**: Wrap `can-i-deploy` to succeed when the application is not registered in the Pact Broker:

```bash
pact-broker can-i-deploy --pacticipant $APP --version $VERSION --to-environment production \
  || [[ $? == 1 && "$(pact-broker can-i-deploy ... 2>&1)" == *"does not exist"* ]] && echo "Not in Pact Broker — skipping"
```

Or use `--dry-run` initially to validate the pipeline without blocking deployments.
