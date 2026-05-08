# Pact Provider Guide

> Sources: https://docs.pact.io/provider.md, https://docs.pact.io/provider/recommended_configuration.md, https://docs.pact.io/provider/handling_auth.md, https://docs.pact.io/provider/how_to_fix_failing_verification_tests.md, https://docs.pact.io/provider/using_provider_states_effectively.md

---

## Provider Verification Fundamentals

- **Always verify against a locally running instance** of the provider, not a deployed environment. External dependencies (other services) should be stubbed.
- **Run pact:verify in CI** alongside all other tests.
- **Only stub layers below where the request body is extracted** — if you stub too high, you could send garbage in a POST body and the test would still pass.
- **Publish verification results** to the Pact Broker so consumers can see the status.

---

## Recommended Provider Configuration

> Source: https://docs.pact.io/provider/recommended_configuration.md

There are two reasons to run pact verification:

1. **Provider change**: Full regression verification against all consumers and all supported environments.
2. **Pact change**: Only the changed pact needs to be verified (triggered by webhook).

### Verification triggered by a provider change

#### Consumer Version Selectors (branches/environments — recommended)

```javascript
// JavaScript example
const verificationOptions = {
  provider: "example-provider",
  pactBrokerUrl: "http://test.pactflow.io",
  consumerVersionSelectors: [
    { mainBranch: true }, // latest from consumer's main branch
    { matchingBranch: true }, // latest from branch matching current provider branch
    { deployedOrReleased: true }, // all currently deployed/released versions
  ],
  enablePending: true,
  // Only include WIP pacts on main branch
  ...(process.env.GIT_BRANCH === "main"
    ? { includeWipPactsSince: "2020-01-01" }
    : {}),
  // Publishing verification results
  publishVerificationResult: process.env.CI === "true",
  providerVersion: process.env.GIT_COMMIT,
  providerVersionBranch: process.env.GIT_BRANCH,
};
```

```ruby
# Ruby example
Pact.service_provider "example-provider" do
  app_version ENV['GIT_COMMIT']
  app_version_branch ENV['GIT_BRANCH']
  publish_verification_results ENV['CI'] == 'true'

  honours_pacts_from_pact_broker do
    pact_broker_base_url 'http://test.pactflow.io'
    consumer_version_selectors [
      { main_branch: true },
      { matching_branch: true },
      { deployed_or_released: true }
    ]
    enable_pending true
    include_wip_pacts_since ENV['GIT_BRANCH'] == "main" ? "2020-01-01" : nil
  end
end
```

#### Consumer Version Selectors (tags — legacy, still supported)

```javascript
consumerVersionSelectors: [
  { tag: "main", latest: true },
  { tag: process.env.GIT_BRANCH, latest: true }, // matching feature branch
  { tag: "test", latest: true },
  { tag: "production", latest: true },
];
```

### Pending pacts

Enable `enablePending: true` (or `enable_pending true` in Ruby). This ensures the build only fails when a breaking change causes a **previously supported** pact to fail. New consumer interactions (that have never been verified) will not break the provider build.

**Prerequisites**: consumer must set `mainBranch` property and publish with a branch name; provider must set branch/version when verifying.

### Work In Progress (WIP) pacts

Enable with `includeWipPactsSince: "YYYY-MM-DD"`. Automatically includes new pacts (that haven't been verified on the provider's main branch) without requiring manual config changes. Best enabled only on the provider's main branch.

### Verification triggered by a pact change (webhook-driven)

When triggered by a webhook (pact URL passed via env var):

```javascript
// Only use pactUrls — don't set pactBrokerUrl or consumerVersionSelectors
const verificationOptions = {
  pactUrls: [process.env.PACT_URL],
  publishVerificationResult: process.env.CI === "true",
  providerVersion: process.env.GIT_COMMIT,
  providerVersionBranch: process.env.GIT_BRANCH,
};
```

---

## Handling Authentication

> Source: https://docs.pact.io/provider/handling_auth.md

**Option 1: Test auth code outside of Pact**
Authentication protocols use stable patterns. Consider whether auth needs to be in the contract, or whether it can be covered by canary tests or lightweight integration tests.

**Option 2: Stub auth services with hardcoded credentials**
Stub auth/authz services to accept pre-agreed hardcoded credentials. Most practical for OAuth, JWT, and similar.

**Option 3: Set up users with matching credentials using provider states**
Pre-agree on credentials and set up the matching user data in a provider state. Works when user data is internal to the service.

**Option 4: Modify the request using a request filter**
Most Pact implementations allow modifying the request before it is replayed (e.g. pact-jvm request filter, Ruby Rack middleware). Use this to inject real credentials.

**Option 5: Use a long-lived token**
Not ideal, but pragmatic if other options are impractical.

---

## Fixing Failing Verification Tests

> Source: https://docs.pact.io/provider/how_to_fix_failing_verification_tests.md

For Ruby, JS, Python, Go, Swift:

1. Identify the failing branch from CI. Check it out locally.
2. Run pact tests locally with read-only credentials.
3. Isolate the first failing interaction using `PACT_BROKER_INTERACTION_ID`:
   ```bash
   export PACT_BROKER_INTERACTION_ID="3c82fcae84594130d4d118d0d790440f41e630db"
   # Then run the verification task — only the failing interaction will run
   ```
4. Locate the provider state setup code by searching for the state string (e.g. "Given a webhook has been triggered").
5. Determine whether it's a code fix or a data fix.
6. Fix and repeat with the next error.
7. Commit and push.

**Common causes of failures**:

- Provider state not set up correctly (missing or wrong test data)
- Wrong field type being returned (string vs number)
- Missing required fields in the response
- Request format changed on the consumer side
- Auth headers not being injected correctly

Use the MCP tool to diagnose:

```
contract-testing_review_pact_tests
  pact_tests: "<content of failing pact file>"
  error_messages: "<output from the failing test run>"
```

---

## Using Provider States Effectively

> Source: https://docs.pact.io/provider/using_provider_states_effectively.md

### The false positive problem

Consumer declares: `GET /search-alligators?name=Mary` — expects one alligator named Mary.

But the correct parameter is `?firstname=Mary`. The provider ignores the wrong param and returns the one alligator (set up in the provider state). Test passes. In production, the wrong param is ignored and ALL alligators are returned.

### Solution 1: Echo the query params in the response

Provider returns which params it actually used:

```json
{ "query": { "firstname": ["Mary"] }, "alligators": [...] }
```

The consumer test would fail if it expected `{"query": {"name": ...}}`, revealing the bug.

### Solution 2: Use multiple data points in the provider state

Provider state: "an alligator named Mary exists AND an alligator named John exists"

Consumer expects: exactly one alligator named Mary.

If the wrong param is used, both alligators are returned, the count assertion fails, and the bug is caught.

### Naming provider states

- Make state names descriptive and reusable: `"user with ID 123 exists"`, `"no users exist"`, `"user 123 has an expired subscription"`
- Before writing new consumer tests, call `contract-testing_get_provider_states` to reuse existing state names
- Keep states minimal — set up exactly what is needed for the interaction, nothing more
