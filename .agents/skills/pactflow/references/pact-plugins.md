# Pact Plugin Framework

> Sources: https://docs.pact.io/plugins/quick_start.md, https://docs.pact.io/plugins/directory.md, https://docs.pact.io/implementation_guides/pact_plugins.md, https://docs.pact.io/implementation_guides/javascript/docs/plugins.md

---

## What is the Plugin Framework?

The Pact Plugin Framework extends Pact beyond HTTP and JSON to support custom **transports** and **protocols**. It was created to handle use cases that the core Pact framework couldn't support out of the box.

**Examples of what plugins enable:**

- gRPC (over HTTP/2)
- Protobuf messages
- WebSockets / TCP
- CSV content matching
- Avro messages
- GraphQL custom handling
- Any proprietary protocol

---

## How It Works

Plugins communicate with the Pact core via gRPC. When a test runs:

1. Your test uses `usingPlugin(name, version)` to declare a plugin dependency
2. The **Plugin Driver** (built into the Pact Rust core / JVM driver) discovers and starts the plugin process
3. The plugin starts a gRPC server and registers its capabilities (content matchers, mock servers, verifiers)
4. Pact routes interactions through the plugin for both consumer mock generation and provider verification

**Interaction types** work with plugins:

- `Synchronous/HTTP` — standard HTTP, plugin provides custom content matching or request/response handling
- `Asynchronous/Messages` — one-way events (Kafka, SNS, etc.), plugin handles message format
- `Synchronous/Messages` — request/response over non-HTTP (gRPC, WebSocket, TCP)

---

## Available Plugins

| Plugin                                                                                 | Type            | Language | Support             |
| -------------------------------------------------------------------------------------- | --------------- | -------- | ------------------- |
| [`pact-protobuf-plugin`](https://github.com/pactflow/pact-protobuf-plugin)             | Protobuf + gRPC | Rust     | Official (PactFlow) |
| [`pact-csv-plugin`](https://github.com/pact-foundation/pact-plugins/tree/main/plugins) | CSV content     | Rust     | Official            |
| [`pact-avro-plugin`](https://github.com/austek/pact-avro-plugin)                       | Avro messages   | Scala    | Community           |

---

## Installing Plugins

Plugins are installed into `$HOME/.pact/plugins/<plugin-name>-<version>/`.

### Via the Pact Plugin CLI

```bash
# Install the Pact Plugin CLI
# Download from: https://github.com/pact-foundation/pact-plugins/releases

# Install a plugin
pact-plugin-cli install pact-protobuf-plugin

# List installed plugins
pact-plugin-cli list

# Remove a plugin
pact-plugin-cli remove pact-protobuf-plugin 1.0.0
```

### Manual installation

1. Download the plugin release archive from the plugin's GitHub releases
2. Extract to `$HOME/.pact/plugins/<plugin-name>-<version>/`
3. Ensure the `pact-plugin.json` manifest is present in that directory

---

## Using Plugins in Tests

### JavaScript (Pact JS)

#### HTTP with a custom content type

```typescript
import { Pact } from "@pact-foundation/pact";

const pact = new Pact({ consumer: "MyConsumer", provider: "MyProvider" });

await pact
  .addInteraction()
  .given("gRPC service is available")
  .uponReceiving("an HTTP request with custom content")
  .usingPlugin({
    // Declare the plugin — must come before request/response
    plugin: "matt",
    version: "0.1.1",
  })
  .withRequest("POST", "/api", (builder) => {
    builder.pluginContents(
      "application/matt",
      `{"request": {"body": "hello"}}`,
    );
  })
  .willRespondWith(200, (builder) => {
    builder.pluginContents(
      "application/matt",
      `{"response": {"body": "world"}}`,
    );
  })
  .executeTest(async (mockserver) => {
    const response = await callApi(mockserver.url, "hello");
    expect(response).to.eq("world");
  });
```

#### Asynchronous message with plugin

```typescript
await pact
  .addAsynchronousInteraction()
  .given("the service is up")
  .usingPlugin({ plugin: "matt", version: "0.1.1" })
  .expectsToReceive("an async MATT message")
  .withPluginContents(`{"response": {"body": "tcpworld"}}`, "application/matt")
  .executeTest(async (message) => {
    const content = Buffer.from(
      String(message?.contents?.content || ""),
      "base64",
    ).toString();
    expect(parseMattMessage(content)).to.eq("tcpworld");
  });
```

#### Synchronous message with custom transport (TCP, gRPC)

```typescript
await pact
  .addSynchronousInteraction("a MATT sync message")
  .usingPlugin({ plugin: "matt", version: "0.1.1" })
  .withPluginContents(
    `{"request": {"body": "hello"}, "response": {"body": "world"}}`,
    "application/matt",
  )
  .startTransport("matt", HOST) // Start the transport (TCP/gRPC) on the given host
  .executeTest(async (tc) => {
    const message = await sendMessageTCP("hello", HOST, tc.port);
    expect(message).to.eq("world");
  });
```

#### Provider verification with plugins (JS)

```javascript
const { Verifier } = require("@pact-foundation/pact");

new Verifier({
  providerBaseUrl: `http://${HOST}:${httpPort}`,
  transports: [
    {
      port: tcpPort,
      protocol: "matt",
      scheme: "tcp",
    },
  ],
  pactUrls: ["./pacts/myconsumer-myprovider.json"],
  messageProviders: {
    "an async MATT message": providerWithMetadata(() => Buffer.from("world"), {
      contentType: "application/matt",
    }),
  },
}).verifyProvider();
```

For HTTP-only plugin interactions, provider verification is **identical** to standard HTTP verification — plugins are loaded automatically.

---

### Java / JVM — Protobuf Example

```java
// Consumer test for a Protobuf message
builder
  .usingPlugin("protobuf")                                           // load the protobuf plugin
  .expectsToReceive("init plugin message", "core/interaction/message")
  .with(Map.of(
    "message.contents", Map.of(
      "pact:proto", filePath("../proto/plugin.proto"),              // path to .proto file
      "pact:message-type", "InitPluginRequest",                     // the message type to test
      "pact:content-type", "application/protobuf",
      "implementation", "notEmpty('pact-jvm-driver')",              // matching expression
      "version", "matching(semver, '0.0.0')"                        // semantic version matcher
    )
  ))
  .toPact();
```

**Key fields for Protobuf plugin**:

- `pact:proto` — path to the `.proto` file (relative to test file)
- `pact:message-type` — the Protobuf message type to test
- `pact:content-type` — must be `application/protobuf`
- Field values use **matching rule expressions** (not standard Pact DSL matchers)

**Matching rule expression syntax** (used in Protobuf/plugin contexts):

- `notEmpty('value')` — field must not be empty, use `'value'` as example
- `matching(semver, '1.0.0')` — must match semver format
- `matching(regex, 'pattern', 'example')` — regex match
- `matching(type, null)` — type match
- `matching(equalTo, 'VALUE')` — exact match
- `eachValue(matching($'items'))` — each value in a repeated field matches template

**Nested messages**: use a `Map` for nested message fields. **Repeated/map fields**: include a `pact:match` entry with an expression like `eachValue(matching(type, null))`.

#### Provider verification for Protobuf

Use the `pact_verifier_cli` (must be v0.9.0+) pointing at the running provider:

```bash
pact_verifier_cli \
  -f ./pacts/consumer-provider.json \
  -p 8111
```

Or in JVM, the standard `@TestTemplate` + `PactVerificationInvocationContextProvider` setup works — plugins are auto-loaded.

---

## Plugin Matching Expressions

Plugins typically use the [Matching Rule Definition Expression](https://github.com/pact-foundation/pact-plugins/blob/main/docs/matching-rule-definition-expressions.md) syntax rather than the language-native DSL matchers:

| Expression                                       | Meaning                                                       |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `notEmpty('example')`                            | Field must not be empty; use `example` as the generated value |
| `matching(type, 'example')`                      | Match by type only (not value)                                |
| `matching(equalTo, 'exact')`                     | Exact value match                                             |
| `matching(regex, 'pattern', 'example')`          | Regex pattern match                                           |
| `matching(semver, '1.0.0')`                      | Semantic version format                                       |
| `matching(contentType, 'mime', 'example')`       | Content-type-aware matching                                   |
| `eachKey(matching(regex, 'pattern', 'example'))` | Apply matcher to each key in a map                            |
| `eachValue(matching(type, null))`                | Apply matcher to each value in a repeated/map field           |
| `atLeast(N)` / `atMost(N)`                       | Array length constraints                                      |

---

## Example Demos

| Type     | Scenario         | Languages                              |
| -------- | ---------------- | -------------------------------------- |
| gRPC     | Area Calculator  | Java (Gradle/Maven), Rust, Go          |
| Protobuf | Plugin interface | Java, Rust (consumer); Go (provider)   |
| CSV      | Content type     | Java, Rust (consumer); Rust (provider) |

Interactive tutorial (gRPC, Protobuf, CSV in Go/Rust/Java):
https://killercoda.com/safdotdev/course/safacoda/grpc_quick_start

---

## Building Your Own Plugin

If no existing plugin covers your use case, you can build one:

1. **Template**: Start with the [Go plugin template](https://github.com/pact-foundation/pact-plugin-template-golang) — includes all boilerplate
2. **Workshop**: Step-by-step tutorial at https://killercoda.com/pactflow/scenario/create-a-plugin (runs in browser)
3. **Docs**:
   - [Writing a plugin guide](https://docs.pact.io/implementation_guides/pact_plugins/docs/writing-plugin-guide)
   - [Protocol design](https://docs.pact.io/implementation_guides/pact_plugins/docs/protocol-plugin-design) — for new transports
   - [Content matcher design](https://docs.pact.io/implementation_guides/pact_plugins/docs/content-matcher-design) — for new content types

Plugins communicate via gRPC. They must:

- Provide a `pact-plugin.json` manifest describing the plugin
- Start a gRPC server on load and return the port to the driver
- Register capabilities in a catalogue (matchers, mock servers, verifiers)
- Respond to driver messages for mock generation and verification
