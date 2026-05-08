# Pact Recipes & Common Patterns

> Sources: https://docs.pact.io/recipes.md, https://docs.pact.io/recipes/graphql.md, https://docs.pact.io/recipes/kafka.md, https://docs.pact.io/recipes/optional.md, https://docs.pact.io/consumer/using_pact_to_support_ui_testing.md

---

## Recipe Index

| Pattern                                          | Description                                              |
| ------------------------------------------------ | -------------------------------------------------------- |
| [Optional Fields](#optional-fields)              | Testing payloads where some fields may be absent or null |
| [GraphQL](#graphql)                              | Strategies for testing GraphQL endpoints                 |
| [Kafka / Message Queues](#kafka--message-queues) | Contract testing for async message-based APIs            |
| [API Gateway](#api-gateway)                      | Dealing with AWS API Gateway, Kong, and similar          |
| [AWS Signed Requests](#aws-signed-requests)      | Testing services that use AWS Signature V4               |
| [Cypress Integration](#cypress-integration)      | Combining Pact with Cypress UI tests                     |
| [UI Testing with Pact](#ui-testing-with-pact)    | Using pact stubs as fixtures for UI tests                |

---

## Optional Fields

> Source: https://docs.pact.io/recipes/optional.md

Optional values in API responses are a common challenge because Pact has no "optional" matcher. There is no `stringOrNull(...)` — you cannot define something like this inline.

### Solution 1: Provider States

Define separate interactions for each variant using different provider states.

```javascript
// Consumer: two interactions, one per variant
it("returns a user with lastLogin", async () => {
  await pact
    .addInteraction()
    .given("user 1 has previously logged in")
    .uponReceiving("a request to get a user")
    .withRequest("GET", "/users/1")
    .willRespondWith(200, (builder) => {
      builder.jsonBody({ id: "1", lastLogin: "2025-10-20" });
    })
    .executeTest(async (mockserver) => {
      const user = await client.getUser(1);
      expect(user.lastLogin).to.exist;
    });
});

it("returns a user without lastLogin", async () => {
  await pact
    .addInteraction()
    .given("user 1 has not previously logged in")
    .uponReceiving("a request to get a user")
    .withRequest("GET", "/users/1")
    .willRespondWith(200, (builder) => {
      builder.jsonBody({ id: "1" });
    })
    .executeTest(async (mockserver) => {
      const user = await client.getUser(1);
      expect(user.lastLogin).to.be.undefined;
    });
});

// Provider: state handlers for each variant
const stateHandlers = {
  "user 1 has previously logged in": () => {
    userRepository.set("1", new User("Bill", "2025-10-20"));
  },
  "user 1 has not previously logged in": () => {
    userRepository.set("1", new User("Bill", null));
  },
};
```

### Solution 2: Array Contains Matcher (Pact V4)

When working with lists of objects with different shapes, the Array Contains matcher verifies that all expected variants appear in the provider response. Extra objects in the response are ignored.

```javascript
// Consumer
await pact
  .addInteraction()
  .uponReceiving("a request for users with various states")
  .withRequest("GET", "/users")
  .willRespondWith(200, (builder) => {
    builder.jsonBody({
      users: Matchers.arrayContaining(
        Matchers.like({ id: "123", lastLogin: null }),
        Matchers.like({ id: "456", lastLogin: "2025-10-20" }),
      ),
    });
  })
  .executeTest(async (mockserver) => {
    const users = await client.getUsers();
    // Consumer can handle both shapes
  });
```

**Guidance**:

- Use Provider States when you can easily control data setup per scenario
- Use Array Contains for collections with varying shapes
- Test "minimum" and "maximum" object shapes — don't test every combination

---

## GraphQL

> Source: https://docs.pact.io/recipes/graphql.md

GraphQL is just HTTP, so you can use Pact to test it like any other HTTP API.

- **Query string GraphQL**: works out of the gate — use standard HTTP matching
- **POST-based GraphQL**: create a utility function to wrap requests and reduce boilerplate

Some languages have GraphQL helpers:

- **Pact JS**: `import { GraphQLInteraction } from '@pact-foundation/pact'`
- **Pact Go**: GraphQL helper available via PR

### Tips for GraphQL testing

- Match on the `query` field in the request body using type matching (not exact) — query whitespace and formatting can vary
- Use regex on the query string if you need to pin the operation name
- Response body: use type/structure matching rather than exact values

### Examples

- Pact JS: https://github.com/pact-foundation/pact-js/tree/master/examples/graphql
- Pact Go: https://github.com/pact-foundation/pact-go/blob/v1.x.x/examples/graphql/consumer/graphql_consumer_test.go

---

## Kafka / Message Queues

See `references/pact-messages.md` for full Kafka consumer/provider examples with Java/JVM.

**Key points**:

- Pact abstracts away the transport — it focuses on message content
- Use `ProviderType.ASYNCH` in JVM tests
- Use `providerWithMetadata` in JS tests
- Set `contentType` in metadata to control serialization behavior
- For Confluent Schema Registry: use `application/vnd.schemaregistry.v1+json` contentType — Pact handles the 5 magic bytes automatically

---

## API Gateway

When your provider sits behind an API Gateway (AWS API Gateway, Kong, Nginx), you have two choices:

### Option 1: Bypass the gateway in tests

Point the provider verification directly at the application server (not the gateway). The gateway-level concerns (auth, routing, rate limiting) are tested separately.

This is the recommended approach. The pact only covers what the consumer's API client sends and receives. Gateway concerns are orthogonal.

### Option 2: Include the gateway

If the gateway transforms requests/responses (e.g. adds JWT claims, translates paths), you may need to include it. Use a `requestFilter` on the provider side to inject auth headers, or set up a local gateway proxy for tests.

**Warning**: including the gateway in pact tests couples your tests to infrastructure. Only do this if transformations genuinely affect the contract.

---

## AWS Signed Requests

For services that use [AWS Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html):

Use a **request filter** on the provider side to sign requests before they're sent to the provider. This is the same approach as auth token injection:

```javascript
requestFilter: (req, res, next) => {
  // Sign the request using aws4 or similar library
  const signedHeaders = signRequest(req);
  Object.assign(req.headers, signedHeaders);
  next();
};
```

On the consumer side, don't worry about the signing in the pact test — you're testing the payload structure, not the auth mechanism.

---

## Cypress Integration

> Source: https://docs.pact.io/recipes/cypress.md

**Best practice**: Don't use Pact and Cypress together for the same tests. Instead:

1. Run Pact consumer tests to generate pact files
2. Use the generated pact files (or shared fixtures) as HTTP stubs in your Cypress tests

This avoids:

- Hard-to-debug tests with multiple simultaneous mock interactions
- Multiple redundant calls with slight variations
- Coupling UI test setup to Pact library internals

### Converting Cypress stubs to Pact

Libraries like [`msw-pact`](https://github.com/you54f/msw-pact) can convert your `cy.route()` / `cy.intercept()` calls into pact files — giving you a pact contract without rewriting your Cypress tests.

PactFlow also has [dedicated Cypress + Pact examples](https://docs.pactflow.io/docs/examples/cypress/readme) showing how to safely combine the two.

---

## UI Testing with Pact

> Source: https://docs.pact.io/consumer/using_pact_to_support_ui_testing.md

The generated pact file is a JSON document describing all the HTTP interactions your consumer depends on. You can use it as a source of truth for HTTP stubs in UI tests:

1. Run Pact consumer tests → generates `pact.json`
2. Serve the pact as a stub using the [Pact Stub Server](https://github.com/pact-foundation/pact-stub-server):
   ```bash
   pact-stub-server --file ./pacts/consumer-provider.json --port 8080
   ```
3. Point your UI tests at `http://localhost:8080`

This gives you:

- UI tests that use the same fixtures as your contract tests (no drift)
- HTTP stubs that are guaranteed to match what the provider will actually return
- Fast, hermetic UI tests with no real backend

---

## NestJS

Use [`nestjs-pact`](https://github.com/omermorad/nestjs-pact) for first-class NestJS integration.

## Jest

Use [`jest-pact`](https://github.com/pact-foundation/jest-pact) — wraps Pact's DSL with Jest lifecycle hooks for cleaner test setup.

## Mocha

Use [`mocha-pact`](https://github.com/pact-foundation/mocha-pact) — same idea for Mocha.

## MSW (Mock Service Worker)

Use [`msw-pact`](https://github.com/you54f/msw-pact) to convert MSW handlers into pact files.
