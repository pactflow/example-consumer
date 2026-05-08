# Pact FAQ & When to Use Pact

> Sources: https://docs.pact.io/faq.md, https://docs.pact.io/faq/convinceme.md, https://docs.pact.io/getting_started/what_is_pact_good_for.md, https://docs.pact.io/getting_started/comparisons.md, https://docs.pact.io/getting_started/testing-scope.md, https://docs.pact.io/consumer/contract_tests_not_functional_tests.md

---

## What is Pact good for?

Pact is most valuable for designing and testing integrations where:

- You (or your team/organisation/partner) control the development of **both** the consumer and the provider
- The requirements of the consumer are going to drive the features of the provider
- It is fantastic for developing and testing intra-organisation microservices

### What is Pact NOT good for?

- **Too many consumers** — APIs where the consumer count is so large that direct relationships can't be maintained between consumer and provider teams (e.g. public APIs)
- **Performance and load testing** — Pact is not a load-testing tool
- **Functional testing of the provider** — that is what the provider's own unit/integration tests should do. Pact is about checking the contents and format of requests and responses
- **When you can't load test data into the provider** without using the API being tested (e.g. public APIs with no test environment)
- **"Pass-through" APIs** — providers that merely proxy requests to downstream services without validating them

### Who implements Pact?

Pact is generally implemented by **developers**, during development. The code-first, white-box nature means whoever writes the tests needs:

- Strong understanding of the code under test
- Ability to write code, use existing test frameworks (Jest, JUnit, etc.)
- Understanding of how to create and inject stubs
- Familiarity with the Pact library itself

---

## FAQ

### Why is there no support for specifying optional attributes?

Pact is based on consumer-driven contracts. The contract represents the _minimum_ that the consumer needs. If you have an optional field, you simply don't include it in the pact — the provider is free to return it or not, and the consumer must handle both cases.

For testing optional fields, use **Provider States**: write one interaction with the field present and one without, using different provider states to drive the data.

See `references/pact-recipes.md` for the "Optional Fields" pattern with Array Contains matchers.

### Can I use Pact to test an API I don't control (e.g. a third-party API)?

Technically yes — but the value is limited. Provider verification requires the provider to run the pact against their implementation. Third-party providers won't do this, so you can't get the full contract testing benefit.

For third-party APIs, Pact tests can still serve as documentation of what you expect from the API, or you can use it one-sidedly with a stub server.

### Can I test multi-part interactions (workflows)?

Pact tests are designed to be **independent interactions**. Each test covers a single request/response pair. You can use provider states to set up the data needed for each interaction, but Pact does not support sequential/stateful workflows within a single test.

### How do I deal with dates and timestamps?

Use regex matchers (e.g. `Pact.term(generate: "2020-01-01", matcher: /\d{4}-\d{2}-\d{2}/)`) or type matchers. Do NOT use dynamic/random dates — this creates a new pact content row every run.

### How do I handle authentication?

See `references/pact-provider.md` — "Handling Authentication" section. Short answer: stub auth services with hardcoded credentials, or use request filters to inject a real token at verification time.

### What's the difference between `can-i-deploy` and just running tests?

`can-i-deploy` checks the **contract matrix** — the full picture of which consumer and provider versions have been verified against each other, and which versions are currently deployed to each environment. It prevents you from deploying a consumer version that is not compatible with the _currently deployed_ provider version in the target environment.

Just running tests locally or in CI tells you if your new version is compatible with the _latest_ provider code. `can-i-deploy` checks compatibility with what's actually running in production.

---

## Contract Tests vs Functional Tests

> Source: https://docs.pact.io/consumer/contract_tests_not_functional_tests.md

This is a critical distinction. Contract tests are **not** functional tests.

### What contract tests check

- The **format** and **structure** of requests and responses
- That the consumer correctly creates requests the provider will understand
- That the consumer correctly handles the response the provider returns

### What contract tests do NOT check

- Business logic ("if premium subscriber, return 20% discount")
- Provider-side validation rules
- Specific data values (unless they genuinely matter to the consumer)
- Side effects on the provider (e.g. that a record was created)
- Full end-to-end workflows

### The golden rule

For every interaction in a contract test, ask:

> "If I removed this test, what bug in the consumer or misunderstanding about the provider might be missed?"

If the answer is "none", remove the test.

### Example: wrong vs right

```
# WRONG: testing provider business logic
"when a user has a premium subscription, the discount should be 20%"

# RIGHT: testing the contract
"given user 123 exists, GET /users/123 returns a user object with id (Integer), name (String), and discountRate (Number)"
```

The consumer doesn't need to assert that the discount is 20%. It needs to assert that there IS a discount field, and that it's a Number it can apply.

---

## Testing Scope

> Source: https://docs.pact.io/getting_started/testing-scope.md

Contract tests sit between unit tests and end-to-end tests in the testing pyramid:

```
        /\
       /  \
      / E2E \      ← Full stack, expensive, brittle
     /--------\
    / Contract \   ← Integration point, cheap, reliable
   /------------\
  /  Unit Tests  \ ← Isolated component logic
 /----------------\
```

**Contract tests** cover the HTTP boundary — they verify that the consumer creates correct requests, and that the provider returns responses the consumer can handle. They do this cheaply and without needing both services running simultaneously.

### What goes where

| Concern                                             | Test type                             |
| --------------------------------------------------- | ------------------------------------- |
| Consumer's HTTP client creates the right request    | Consumer contract test                |
| Provider's handler returns the right response shape | Provider contract test (verification) |
| Business logic in the provider                      | Provider unit tests                   |
| Business logic in the consumer                      | Consumer unit tests                   |
| Services work together end-to-end                   | E2E tests (minimal, targeted)         |

### Testing scope on the consumer side

Only test the API client layer — the code responsible for making HTTP calls and handling responses. Do NOT write Pact tests that also exercise the business logic that uses the response data; that's what unit tests are for.

### Testing scope on the provider side

Only test that the provider can serve the responses the consumer expects. Do NOT duplicate business logic assertions in the contract — the provider has its own test suite for that.

---

## Comparisons

> Source: https://docs.pact.io/getting_started/comparisons.md

### Pact vs End-to-End Tests

|              | E2E Tests                          | Pact                                            |
| ------------ | ---------------------------------- | ----------------------------------------------- |
| Speed        | Slow (services must be running)    | Fast (no network calls)                         |
| Reliability  | Flaky (environment issues, timing) | Stable                                          |
| Feedback     | Late (full pipeline)               | Early (per-commit)                              |
| Blast radius | Hard to pinpoint failures          | Pinpoints the exact interaction                 |
| Cross-team   | Requires coordination to run       | Async — consumer and provider run independently |

### Pact vs Schema Validation (JSON Schema, OpenAPI)

Schema validation only checks structure — it doesn't verify that the provider _actually_ returns data matching the schema, and it doesn't tell you which consumers depend on which fields.

Pact (consumer-driven) goes further:

- The consumer declares what it **actually uses** (not the full schema)
- The provider verifies it can satisfy those specific needs
- Results are tracked over time in the Pact Broker
- can-i-deploy prevents deploying incompatible versions

### Pact vs Spring Cloud Contract

|                 | Pact                                                    | Spring Cloud Contract              |
| --------------- | ------------------------------------------------------- | ---------------------------------- |
| Language        | Multi-language (JS, Java, Go, Ruby, .NET, Python, PHP…) | JVM-centric                        |
| Contract origin | Consumer-driven                                         | Can be consumer or provider-driven |
| Spec storage    | Pact Broker                                             | Git                                |
| Ecosystem       | Open source, PactFlow                                   | Spring ecosystem                   |

### Pact vs Postman/Newman

Postman tests hit a real running service. Pact tests don't need the provider running during consumer tests. Pact tests are also bi-directional — both consumer and provider run tests, and results are tracked.

---

## Common Questions from Skeptics

> Source: https://docs.pact.io/faq/convinceme.md

**"We already have E2E tests — why do we need Pact?"**

E2E tests verify that a particular combination of versions work together. They don't tell you _which_ version of each service is compatible with _which_ version of others. Pact gives you a compatibility matrix you can query before deploying any version to any environment.

**"The provider team won't commit to running pact verification."**

Without provider verification, consumer tests are just documentation of assumptions. The value of Pact is in the provider verification step. If you can't get provider buy-in, start with BDCT (Bi-Directional Contract Testing) — the provider publishes an OpenAPI spec, and PactFlow verifies automatically without requiring provider team engagement. See `references/bdct.md`.

**"We use a public/third-party API so we can't control the provider."**

Pact tests can still serve as documentation of your assumptions about the third-party API. You won't get provider verification, but you get a test suite that catches breaking changes when the third-party API changes in ways you didn't expect.

**"Our API changes too quickly for contract tests to be worth it."**

A rapidly changing API is exactly when contract tests are most valuable. Without them, you discover incompatibilities late in integration testing or in production. Pact surfaces them at commit time.
