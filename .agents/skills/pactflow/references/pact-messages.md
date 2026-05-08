# Message Pact (Async & Event-Driven Testing)

> Sources: https://docs.pact.io/getting_started/how_pact_works.md, https://docs.pact.io/implementation_guides/javascript/docs/messages.md, https://docs.pact.io/recipes/kafka.md

---

## Overview

Modern distributed architectures use message queues (ActiveMQ, RabbitMQ, SNS, SQS, Kafka, Kinesis) and event-driven patterns. Pact supports these via **Message Pact**, which abstracts away the queueing technology and focuses on the messages themselves.

Pact does NOT know about specific queueing technology. It focuses on:

- The **structure and content** of messages (not the transport)
- Whether the consumer can **handle** a given message
- Whether the provider can **produce** the correct message structure

---

## How Message Pact Works

### Hexagonal Architecture Pattern

Split your code into:

- **Adapter** — the protocol-specific code (e.g. the AWS Lambda handler that receives SNS, or the Kafka consumer)
- **Port** — the domain code that handles the payload, unaware of the transport

The Pact test targets the **Port**, not the Adapter.

#### Consumer side

The Port is the function that receives the deserialized message and does something with it. Pact verifies that this function can handle the message structure the provider produces.

#### Provider (Producer) side

The Port is the function that creates the message payload. Pact verifies that this function produces the structure the consumer expects.

---

## Message Types

### Asynchronous Messages (Queue/Event-based)

Single messages sent one way: producer → queue → consumer.

Use cases: Kafka events, SNS notifications, SQS messages, EventBridge events.

### Synchronous Messages (Request/Response over non-HTTP)

Request/response pairs over non-HTTP transports.

Use cases: gRPC calls, WebSocket exchanges.

---

## JavaScript (Pact JS)

### Asynchronous Consumer Test

```javascript
import { Pact } from "@pact-foundation/pact";
import { v4SynchronousBodyHandler } from "@pact-foundation/pact";

const messagePact = new Pact({
  consumer: "MyJSMessageConsumer",
  provider: "MyJSMessageProvider",
});

describe("async message consumer", () => {
  it("can handle a dog event", async () => {
    await messagePact
      .addAsynchronousInteraction()
      .given("some state")
      .expectsToReceive("a dog event")
      .withContent({
        id: like(1),
        name: like("Fido"),
        type: like("dog"),
      })
      .withMetadata({ contentType: "application/json" })
      .executeTest(v4SynchronousBodyHandler(dogApiHandler));
  });
});
```

Key points:

- Use `addAsynchronousInteraction()` (not `addInteraction()` for HTTP)
- The actual message body is in the `Message.content` attribute
- Use `v4SynchronousBodyHandler` to wrap your handler if it's synchronous
- All handlers must return `Promise<any>`

### Asynchronous Provider (Producer) Test

```javascript
import {
  MessageProviderPact,
  providerWithMetadata,
} from "@pact-foundation/pact";

const p = new MessageProviderPact({
  messageProviders: {
    "a dog event": providerWithMetadata(
      () => createDog(27), // returns the message payload
      { queue: "animals" }, // optional metadata
    ),
  },
  provider: "MyJSMessageProvider",
  providerVersion: "1.0.0",
  pactUrls: ["./pacts/myjsmessageconsumer-myjsmessageprovider.json"],
});

p.verify();
```

### Synchronous Consumer Test (gRPC / WebSocket)

```javascript
await pact
  .addSynchronousInteraction("a file upload request")
  .given("file upload service is available")
  .withRequest((builder) => {
    builder.withJSONContent({
      filename: like("document.pdf"),
      size: integer(1024),
    });
  })
  .withResponse((builder) => {
    builder.withJSONContent({
      id: like("upload-1"),
      message: like("Upload successful"),
    });
  })
  .executeTest(async (message) => {
    const response = message.Response[0];
    const responseData = JSON.parse(response.content.toString());
    expect(responseData.message).to.equal("Upload successful");
  });
```

---

## Java / Kafka (JVM)

### Kafka JSON Consumer Test

```java
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(
  providerName = "jsonKafkaProviderApp",
  providerType = ProviderType.ASYNCH,
  pactVersion = PactSpecVersion.V3
)
class JsonKafkaConsumerTest {

  @Pact(consumer = "jsonKafkaConsumerApp")
  MessagePact simpleJsonPact(MessagePactBuilder builder) {
    PactDslJsonBody body = new PactDslJsonBody();
    body.stringType("name", "almost-anything");

    return builder
      .expectsToReceive("A simple message")
      .withMetadata(Map.of("contentType", "application/json"))
      .withContent(body)
      .toPact();
  }

  @Test
  @PactTestFor(pactMethod = "simpleJsonPact", providerType = ProviderType.ASYNCH)
  void simpleMessage(List<Message> messages) {
    byte[] kafkaBytes = messages.get(0).contentsAsBytes();
    // Use production deserialization code:
    ConsumerDomainRecord record = productionDeserializer.deserialize("", kafkaBytes);
    assertDoesNotThrow(() -> productionCode.handle(record));
  }
}
```

### Kafka JSON Provider Test

```java
@Provider("jsonKafkaProviderApp")
@Consumer("jsonKafkaConsumerApp")
@PactBroker(url = "http://localhost:9292")
class JsonKafkaProviderTest {

  @BeforeEach
  void before(PactVerificationContext context) {
    context.setTarget(new MessageTestTarget());
  }

  @TestTemplate
  @ExtendWith(PactVerificationInvocationContextProvider.class)
  void pactVerificationTestTemplate(PactVerificationContext context) {
    context.verifyInteraction();
  }

  @PactVerifyProvider("A simple message")
  MessageAndMetadata verifySimpleMessageEvent() {
    Map<String, Object> metadata = Map.of("contentType", "application/json");
    ProviderDomainRecord record = new ProviderDomainRecord("name");
    KafkaJsonSerializer<ProviderDomainRecord> serializer = createProductionSerializer();
    byte[] bytes = serializer.serialize("", record);
    return new MessageAndMetadata(bytes, metadata);
  }
}
```

### Schema Registry (Confluent) — Magic Bytes

When using Confluent Schema Registry, messages are prefixed with 5 "magic bytes". Set the contentType to `application/vnd.schemaregistry.v1+json` in the pact metadata — Pact will automatically prepend/strip these bytes:

```java
return builder
  .expectsToReceive("A json schema message")
  .withMetadata(Map.of("contentType", "application/vnd.schemaregistry.v1+json"))
  .withContent(body)
  .toPact();
```

Use a `MockSchemaRegistryClient` in tests (so it doesn't hit a real registry):

```java
private MockSchemaRegistryClient schemaRegistryClient = new MockSchemaRegistryClient();
```

---

## Optional Fields in Message Responses

Optional fields in message payloads follow the same patterns as HTTP optional fields:

1. **Provider States** — write separate interactions for "field present" vs "field absent"
2. **Array Contains** (Pact V4) — for arrays containing objects with different shapes

See `references/pact-recipes.md` for full examples.

---

## Message Pact File Structure

A generated message pact file looks like:

```json
{
  "consumer": { "name": "jsonKafkaConsumerApp" },
  "messages": [
    {
      "_id": "753ff77671f87af7045426b6f333e767315fbf2e",
      "contents": { "name": "almost-anything" },
      "description": "A simple message",
      "matchingRules": {
        "body": {
          "$.name": { "combine": "AND", "matchers": [{ "match": "type" }] }
        }
      },
      "metaData": { "contentType": "application/json" }
    }
  ],
  "metadata": {
    "pactSpecification": { "version": "3.0.0" }
  },
  "provider": { "name": "jsonKafkaProviderApp" }
}
```

Key differences from HTTP pact files:

- Top-level key is `messages` (not `interactions`)
- Each message has `contents` (not `request`/`response`)
- Matching rules apply to `body` (the message contents)
- `metaData` carries content-type and other transport hints

---

## Publishing Message Pacts

Message pact files are published to the Pact Broker exactly like HTTP pact files:

```
contract-testing_publish_consumer_contracts
  pacticipantName: "MyKafkaConsumer"
  pacticipantVersionNumber: "<git-sha>"
  branch: "<git-branch>"
  contracts: [
    {
      consumers: ["MyKafkaProvider"],
      pact: "<base64-encoded pact file contents>"
    }
  ]
```

Provider verification results are also published back automatically by the Pact library.
