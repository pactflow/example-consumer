# Pact Consumer Guide

> Sources: https://docs.pact.io/consumer.md, https://docs.pact.io/getting_started/matching.md, https://docs.pact.io/consumer/recommended_configuration.md

---

## The Golden Rule for Writing Consumer Tests

When authoring consumer pact tests: **start with the goal of writing a good set of unit tests for your API client.** An important side-effect of doing this with Pact is that you also produce an API contract you can use for contract testing.

The art of writing good consumer Pact tests is mostly about knowing what **not** to test.

### What to test

- Bugs in how the consumer **creates requests** or **handles responses**
- **Misunderstandings** about how the provider will respond

### What NOT to test

- Bugs in the provider (belongs in provider tests)
- Business logic unrelated to the HTTP exchange
- Side effects on the provider (belongs in functional tests)

**Rule of thumb**: If you don't include a scenario, what bug in the consumer or what misunderstanding about the provider might be missed? If the answer is none, don't include it.

---

## Only Test What Would Affect the Consumer If It Changed

Avoid asserting on general business rules you know about the provider (e.g. "customer ID format is `[A-Z]{3}-\d{3}`"). Only assert on things that would break the consumer if they changed (e.g. "a link must start with `http` because the consumer builds absolute URLs from it").

This allows the provider to evolve without false alerts from overly strict pact verification tests.

---

## Choosing the Right Matching Type

**For requests (consumer side)**:

- Exact matching is usually appropriate for unit-level tests — you control both the expectation and the actual request.
- If using Pact for broader tests, use type-based matching and regular expressions to avoid brittleness.

**For responses**:

- Loose (type-based) matching is generally recommended. Ask: "if I made this looser/tighter what bugs would I miss/prevent?"
- Use exact matching only when the exact value matters to the consumer.
- Avoid strict matchers on fields where you're parsing data out that the API should be providing separately.

---

## Matching Features

> Source: https://docs.pact.io/getting_started/matching.md

### Regular expressions

Use when a value must match a pattern but the exact value doesn't matter:

```ruby
# Ruby DSL example
body: {
  name: "Mary",
  dateOfBirth: Pact.term(
    generate: "02/11/2013",
    matcher: /\d{2}\/\d{2}\/\d{4}/)
}
```

- Consumer test: mock returns the `generate` value
- Provider verification: checks that the actual value matches the `matcher` regex

### Type matching (SomethingLike)

Use when you care about the type but not the exact value:

```ruby
body: Pact.like(
  name: "Mary",   # any String
  age: 73         # any Integer
)
```

Wrap only specific fields to mix exact and type matching:

```ruby
body: {
  name: "Mary",        # exact match
  age: Pact.like(73)   # any Integer
}
```

### Flexible-length arrays (EachLike)

Use when you expect an array of items matching a certain structure, but don't care about the exact count:

```ruby
body: {
  alligators: Pact.each_like({ name: "Mary", age: 3 })
  # Any array with at least one item matching this structure
}
```

You can specify the minimum count:

```ruby
Pact.each_like({ name: "Mary" }, minimum: 2)
```

### Query params

Specified as a string (exact match) or a hash (flexible order):

```ruby
# Exact string — order matters
query: "name=Mary+Jane&age=8"

# Hash — order doesn't matter, can embed Pact::Term
query: {
  name: 'Mary Jane',
  age: '8',
  children: ['Betty', 'Sue']  # array — order enforced
}
```

### Matching gotchas (Postel's Law)

> Source: https://docs.pact.io/getting_started/matching/gotchas.md

Pact follows Postel's Law: be conservative in what you send, be liberal in what you accept.

- **Extra keys in the response are allowed** — pact verification only checks the keys in the pact, not that the response contains _only_ those keys.
- **Extra keys in the request are NOT allowed** — the provider mock expects an exact request (unless you use matchers).
- **Type matching on arrays**: `EachLike` checks each element against the template, but does not enforce the array length unless `minimum` is specified.
- **Regex on strings only** — regular expressions can only be applied to String values.

---

## Recommended Consumer Configuration

> Source: https://docs.pact.io/consumer/recommended_configuration.md

### Publishing pacts

Always publish pacts with:

1. **A branch name** (the git branch the consumer is on) — required for branch-based can-i-deploy
2. **A version number** (use the git SHA for accuracy)
3. **A build URL** (optional but helpful for traceability)

```bash
# Using pact-broker CLI
pact-broker publish ./pacts \
  --pacticipant YourConsumer \
  --version $GIT_COMMIT \
  --branch $GIT_BRANCH \
  --broker-base-url $PACT_BROKER_BASE_URL
```

Or use the MCP tool:

```
contract-testing_publish_consumer_contracts
  pacticipantName: "YourConsumer"
  pacticipantVersionNumber: "<git-sha>"
  branch: "<git-branch>"
  contracts: [...]
  buildUrl: "<ci-build-url>"
```

### After deploying to an environment

Record the deployment so can-i-deploy has accurate state:

```
contract-testing_record_deployment
  pacticipantName: "YourConsumer"
  versionNumber: "<git-sha>"
  environmentId: "<environment-uuid>"
```

### Using tags (legacy — prefer branches)

Tags were the original way to track branches and deployments. They are still supported but branches + environments are now preferred. If you must use tags:

- Tag with branch name when publishing (e.g. `main`, `feat/new-api`)
- Tag with environment name when deploying (e.g. `production`, `staging`)

---

## Avoiding Common Pitfalls

### Don't use Pact for UI tests

If you use Pact for UI tests you will end up with:

- Very hard to debug tests with multiple simultaneous mock interactions
- Multiple redundant calls with slight variations that increase maintenance

Instead: use the generated pact file itself (or shared fixtures) to provide HTTP stubs for UI tests.

### Don't test functional logic

```
# BAD: testing provider business logic
"when a user has a premium subscription, the discount should be 20%"

# GOOD: testing the contract
"given user 123 exists, GET /users/123 returns a user object with name (String) and discount (Number)"
```

### Test only the API client layer

Write Pact tests for the class/function responsible for making HTTP calls to the provider. Don't cover multiple layers of the consumer stack — it makes tests brittle and creates an explosion of interactions.

### Don't use random data in pacts

Random or dynamic data in pacts creates a new database row every time. Use stable, fixed example values and rely on matchers (regex, type) for flexibility. The mock server replays fixed `generate` values; the provider checks the pattern.
