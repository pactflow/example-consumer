# Pact Core Concepts

> Sources: https://docs.pact.io/getting_started/terminology.md, https://docs.pact.io/getting_started/how_pact_works.md, https://docs.pact.io/getting_started/provider_states.md

---

## Terminology

### Service Consumer

For HTTP: An application that initiates an HTTP request to another application (the service provider). The consumer is always the initiator — regardless of whether the request is a GET or PUT/POST/PATCH.

For messages: An application which reads a message or data structure created by another application.

### Service Provider

For HTTP: A server that responds to an HTTP request from another application. A service provider may have one or more HTTP endpoints, and should be thought of as the "deployable unit" — endpoints that get deployed together should be considered part of the same provider.

For messages: An application that creates a message or data structure for another application to read.

### Interaction

A request and response pair. Each interaction has a description and one or more provider states. An HTTP pact consists of a collection of interactions.

### Pact file

A JSON file containing serialised interactions (requests and responses) or messages defined in the consumer tests. This is the Contract. A pact defines: consumer name, provider name, a collection of interactions or messages, and the pact specification version.

### Pact verification

For HTTP: The requests contained in a pact file are replayed against the provider code, and the responses returned are checked to ensure they match those expected in the pact file.

For messages: A piece of code on the provider is executed to generate a message for a given description, and the generated message is checked to ensure it matches what the pact file expects.

### Provider state

On the consumer side: A name describing a "state" (like a fixture) that the provider should be in when a given request is replayed — e.g. "when user John Doe exists" or "when user John Doe has a bank account". These allow the same endpoint to be tested under different scenarios.

On the provider side: When pact verification is executed, the provider state name is used to identify the setup code block to run before the request is executed.

### Pact specification

The [Pact Specification](https://github.com/pact-foundation/pact-specification) governs the structure of generated pact files for interoperability between languages. Uses semantic versioning. Current version: V4. See https://docs.pact.io/roadmap/feature_support for language support.

### Pact Broker

A permanently running, externally hosted service with an API and UI that allows contract testing to be integrated into a CI/CD pipeline. Open source project.

### PactFlow

A commercial offering of the Pact Broker which adds features required to use Pact at scale. Managed by SmartBear.

### The Matrix

A table showing the compatibility status of each consumer version and provider version, as determined by contract verification results. Feature of Pact Broker and PactFlow.

### Can-I-Deploy

A command line tool (also exposed as an MCP tool via `contract-testing_can_i_deploy`) that uses the Matrix to determine whether an application version is safe to deploy to a particular environment. It checks that there is a successful verification result between the application being deployed and the currently deployed version of each integrated application in that environment.

### Pacticipant

The term used in the Pact Broker/PactFlow API for "an application that participates in a pact". Both consumers and providers are pacticipants.

---

## How Pact Works

### Consumer testing

Consumer Pact tests operate on each interaction to answer: "assuming the provider returns the expected response for this request, does the consumer code correctly generate the request and handle the expected response?"

Process:

1. Using the Pact DSL, the expected request and response are registered with the mock service.
2. The consumer test code fires a real request to a mock provider (created by the Pact framework).
3. The mock provider compares the actual request with the expected request, and emits the expected response if comparison is successful.
4. The consumer test code confirms that the response was correctly understood.

Each interaction is independent — no context is maintained between interactions. Provider states handle the need for preconditions.

Once all interactions are tested, the Pact framework generates a pact file describing each interaction.

### Provider verification

In provider verification, each request from the pact file is sent to the provider, and the actual response is compared with the minimal expected response described in the consumer test.

Provider verification passes if each request generates a response that contains **at least** the data described in the minimal expected response (additional fields in the response are allowed).

The Pact framework calls provider state setup code before each interaction to put the provider in the right state.

### Message Pact (non-HTTP)

For async systems (Kafka, RabbitMQ, SNS, SQS, etc.):

- **Consumer side**: Test that the consumer can handle a given message payload. The Pact test targets the "Port" — the code that handles the domain payload, not the adapter that talks to the queue technology.
- **Provider side**: Test that the "Port" code can produce the correct message structure.

Pact abstracts away the queue technology and focuses on the message payload. The intermediary (queue/topic/bus) is replaced by the Pact framework during testing.

---

## Provider States — Deep Dive

> Source: https://docs.pact.io/getting_started/provider_states.md and https://docs.pact.io/provider/using_provider_states_effectively.md

A provider state is the **necessary precondition** for a particular test scenario to run. Think of it as the `Given` clause in Cucumber BDD.

Each interaction in a pact is verified in isolation, with no context from previous interactions. Provider states allow you to inject data directly into the data source before the interaction is run.

**What provider states can do:**

- Set up data records that must exist (e.g. "a user with id 123 exists")
- Stub downstream systems
- Return error responses that are hard to cause normally (e.g. 500 errors)
- Allow the same endpoint to be tested with different expected responses

**Keep in mind:** A provider state is about the state of the _provider_ (what data is there, how it will handle a response) — not about the state of the consumer or what is in the request.

### Avoiding false positives with provider states

The classic failure mode: the consumer declares `/search-alligators?name=Mary` but the correct param is `?firstname=Mary`. The provider ignores the wrong param and returns data anyway — the test passes, but production fails.

**Solution 1**: Have the provider echo the query params it actually used in the response body:

```json
{ "query": { "name": ["Mary"] }, "alligators": [...] }
```

If the wrong param was used, `query` would be empty and the pact verification would fail correctly.

**Solution 2**: Set up the provider state with multiple data points so a wrong param can't accidentally match:

- Provider state: "an alligator named Mary exists AND an alligator named John exists"
- The pact expects exactly ONE alligator named Mary
- If the wrong param returns all alligators, the count assertion fails

### Fetching existing provider states

Before writing new consumer tests, always check existing provider states with:

```
contract-testing_get_provider_states
  provider: "YourProviderName"
```

This helps reuse existing state names and avoids duplication across consumer tests.
