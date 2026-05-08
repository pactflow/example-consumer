# Pact Language Implementations

> Sources: https://docs.pact.io/implementation_guides/overview.md, https://docs.pact.io/implementation_guides/javascript/docs/consumer.md, https://docs.pact.io/implementation_guides/javascript/docs/provider.md, https://docs.pact.io/implementation_guides/go/docs/consumer.md, https://docs.pact.io/implementation_guides/go/docs/provider.md, https://docs.pact.io/implementation_guides/jvm/consumer.md, https://docs.pact.io/implementation_guides/jvm/provider.md, https://docs.pact.io/implementation_guides/ruby/creating_pacts.md, https://docs.pact.io/implementation_guides/ruby/verifying_pacts.md

**DSL references** (language-specific syntax, matchers, and patterns):
[dsl.javascript.md](dsl.javascript.md) · [dsl.typescript.md](dsl.typescript.md) · [dsl.java.md](dsl.java.md) · [dsl.kotlin.md](dsl.kotlin.md) · [dsl.golang.md](dsl.golang.md) · [dsl.dotnet.md](dsl.dotnet.md) · [dsl.php.md](dsl.php.md) · [dsl.swift.md](dsl.swift.md) · [dsl.python.md](dsl.python.md)

---

## Language Support Matrix

| Language       | Repository                                                            | Pact Spec Support            |
| -------------- | --------------------------------------------------------------------- | ---------------------------- |
| **JavaScript** | [`pact-js`](https://github.com/pact-foundation/pact-js)               | V1, V2, V3, V4               |
| **Java / JVM** | [`pact-jvm`](https://github.com/pact-foundation/pact-jvm)             | V1, V2, V3, V4               |
| **Go**         | [`pact-go`](https://github.com/pact-foundation/pact-go)               | V1, V2, V3, V4               |
| **Ruby**       | [`pact-ruby`](https://github.com/pact-foundation/pact-ruby)           | V1, V2, V3, V4               |
| **.NET**       | [`pact-net`](https://github.com/pact-foundation/pact-net)             | V1, V2, V3, V4               |
| **Python**     | [`pact-python`](https://github.com/pact-foundation/pact-python)       | V1, V2, V3 (beta), V4 (beta) |
| **PHP**        | [`pact-php`](https://github.com/pact-foundation/pact-php)             | V1, V2, V3, V4               |
| **Rust**       | [`pact-reference`](https://github.com/pact-foundation/pact-reference) | V1, V2, V3, V4               |
| **Swift**      | [`PactSwift`](https://github.com/surpher/PactSwift)                   | V3, V4                       |
| **C++**        | [`pact-cplusplus`](https://github.com/pact-foundation/pact-cplusplus) | V3                           |
| **Scala**      | [`pact4s`](https://github.com/jbwheatley/pact4s)                      | V3, V4                       |

> Most implementations wrap the Rust FFI (`pact_ffi`) under the hood for spec V3/V4 support.

---

## JavaScript (pact-js)

### Consumer Tests

```typescript
import {
  Pact,
  Matchers,
  SpecificationVersion,
  LogLevel,
} from "@pact-foundation/pact";

const { like, eachLike } = Matchers;

// `Pact` is aliased to `PactV4` — use this for all new projects
const provider = new Pact({
  dir: path.resolve(process.cwd(), "pacts"),
  consumer: "MyConsumer",
  provider: "MyProvider",
  spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
  logLevel: "debug" as LogLevel,
});

describe("My API client", () => {
  it("gets a list of products", async () => {
    await provider
      .addInteraction()
      .given("products exist")
      .uponReceiving("a request for all products")
      .withRequest("GET", "/products", (builder) => {
        builder.headers({ Accept: "application/json" });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody(
          eachLike({
            id: like(1),
            name: like("Widget"),
          })
        );
      })
      .executeTest(async (mockserver) => {
        const client = new ProductsClient(mockserver.url);
        const products = await client.getProducts();
        expect(products).to.have.length.greaterThan(0);
      });
  });
});
```

**Version selection**: `Pact` is aliased to `PactV4` — always use it for new projects. Pass `spec: SpecificationVersion.SPECIFICATION_VERSION_V4` explicitly. `PactV2` and `PactV3` exports are available only for legacy code.

**V4 builder pattern**: `withRequest(method, path, builder?)` and `willRespondWith(status, builder?)` take optional builder callbacks instead of plain objects — use `builder.headers()`, `builder.jsonBody()`, `builder.query()`, etc.

**Interaction metadata (V4)**: mark interactions as `pending()`, add `comment()`, or set `testName()` for advanced lifecycle control.

### Provider Verification (JS)

```javascript
import { Verifier } from "@pact-foundation/pact";

new Verifier({
  providerBaseUrl: "http://localhost:3000",
  pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,
  provider: "MyProvider",
  providerVersion: process.env.GIT_COMMIT,
  providerVersionBranch: process.env.GIT_BRANCH,
  consumerVersionSelectors: [
    { mainBranch: true },
    { matchingBranch: true },
    { deployedOrReleased: true },
  ],
  enablePending: true,
  includeWipPactsSince:
    process.env.GIT_BRANCH === "main" ? "2020-01-01" : undefined,
  publishVerificationResult: process.env.CI === "true",
  stateHandlers: {
    "products exist": async () => {
      await productRepository.seed([{ id: 1, name: "Widget" }]);
    },
    "no products exist": async () => {
      await productRepository.clear();
    },
  },
  requestFilter: (req, res, next) => {
    req.headers["Authorization"] = `Bearer ${generateToken()}`;
    next();
  },
}).verifyProvider();
```

**Provider verification lifecycle**: `beforeEach` → State handler → `requestFilter (request)` → Execute test → `requestFilter (response)` → `afterEach`

---

## Go (pact-go)

### Consumer Tests

```go
import (
  "github.com/pact-foundation/pact-go/v2/consumer"
  "github.com/pact-foundation/pact-go/v2/matchers"
)

func TestProductsClient(t *testing.T) {
  mockProvider, err := consumer.NewV3Pact(consumer.MockHTTPProviderConfig{
    Consumer: "ProductsConsumer",
    Provider: "ProductsProvider",
  })
  assert.NoError(t, err)

  mockProvider.
    AddInteraction().
    Given("products exist").
    UponReceiving("a request for all products").
    WithRequest("GET", matchers.S("/products")).
    WillRespondWith(200).
    WithBodyMatch(&[]Product{})  // auto-generates matchers from struct

  err = mockProvider.ExecuteTest(t, func(config consumer.MockServerConfig) error {
    client := NewProductsClient(fmt.Sprintf("http://%s:%d", config.Host, config.Port))
    products, err := client.GetProducts()
    assert.NoError(t, err)
    assert.Greater(t, len(products), 0)
    return err
  })
  assert.NoError(t, err)
}
```

**Matchers** (Go):

| Matcher                            | Min Spec | Description              |
| ---------------------------------- | -------- | ------------------------ |
| `Like(value)`                      | V2       | Type match               |
| `Term(example, regex)`             | V2       | Regex match              |
| `EachLike(value, min)`             | V2       | Array of type            |
| `Equality(value)`                  | V3       | Exact value              |
| `ArrayContaining(variants)`        | V3       | Heterogeneous arrays     |
| `FromProviderState(expr, example)` | V3       | Dynamic injection        |
| `DateGenerated` / `TimeGenerated`  | V3       | Cross-platform date/time |

**Auto-generate from struct tags**:

```go
type Product struct {
  ID   string `json:"id"`
  Name string `json:"name"`
  Tags []string `json:"tags" pact:"min=2"`
  Date string `json:"date" pact:"example=2000-01-01,regex=^\\d{4}-\\d{2}-\\d{2}$"`
}
// Use WithBodyMatch(&Product{}) in the interaction
```

### Provider Verification (Go)

```go
func TestProvider(t *testing.T) {
  go startServer()

  verifier := provider.HTTPVerifier{}
  err := verifier.VerifyProvider(t, provider.VerifyRequest{
    ProviderBaseURL: "http://localhost:1234",
    Provider:        "ProductsProvider",
    ProviderVersion: os.Getenv("APP_SHA"),
    ProviderVersionBranch: os.Getenv("GIT_BRANCH"),
    BrokerURL:       os.Getenv("PACT_BROKER_BASE_URL"),
    BrokerToken:     os.Getenv("PACT_BROKER_TOKEN"),
    ConsumerVersionSelectors: []provider.Selector{
      &provider.ConsumerVersionSelector{MainBranch: true},
      &provider.ConsumerVersionSelector{MatchingBranch: true},
      &provider.ConsumerVersionSelector{DeployedOrReleased: true},
    },
    EnablePending:              true,
    IncludeWIPPactsSince:       wipSince,
    PublishVerificationResults: os.Getenv("CI") == "true",
    StateHandlers: provider.StateHandlers{
      "products exist": func(setup bool, s provider.ProviderStateV3) (provider.ProviderStateV3Response, error) {
        if setup {
          productRepo.Seed([]Product{{ID: "1", Name: "Widget"}})
        }
        return nil, nil
      },
    },
    RequestFilter: func(next http.Handler) http.Handler {
      return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        r.Header.Add("Authorization", fmt.Sprintf("Bearer %s", getToken()))
        next.ServeHTTP(w, r)
      })
    },
  })
  assert.NoError(t, err)
}
```

**State handler setup/teardown**: The `setup bool` parameter is `true` before the interaction, `false` after. Use it to set up and tear down test data in the same handler.

---

## Java / JVM (pact-jvm)

### Consumer Tests (JUnit 5)

```java
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "ProductsProvider")
class ProductsConsumerTest {

  @Pact(consumer = "ProductsConsumer")
  RequestResponsePact productsPact(PactDslWithProvider builder) {
    return builder
      .given("products exist")
      .uponReceiving("a request for all products")
        .method("GET")
        .path("/products")
      .willRespondWith()
        .status(200)
        .body(LambdaDsl.newJsonArrayMinLike(1, array ->
          array.object(obj -> {
            obj.numberType("id");
            obj.stringType("name", "Widget");
            obj.stringMatcher("type", "^[A-Z]+$", "PRODUCT");
          })
        ).build())
      .toPact();
  }

  @Test
  @PactTestFor(pactMethod = "productsPact")
  void verifyProductsClient(MockServer mockServer) {
    ProductsClient client = new ProductsClient(mockServer.getUrl());
    List<Product> products = client.getProducts();
    assertThat(products).isNotEmpty();
  }
}
```

**JUnit 4** uses `PactProviderRuleMk2` instead of the JUnit5 extension.

### Provider Verification (JUnit 5)

```java
@Provider("ProductsProvider")
@PactBroker(
  host = "${PACT_BROKER_HOST}",
  authentication = @PactBrokerAuth(token = "${PACT_BROKER_TOKEN}")
)
class ProductsProviderTest {

  @TestTemplate
  @ExtendWith(PactVerificationInvocationContextProvider.class)
  void verifyPact(PactVerificationContext context) {
    context.verifyInteraction();
  }

  @BeforeEach
  void before(PactVerificationContext context) {
    context.setTarget(HttpTestTarget.fromUrl(new URL("http://localhost:" + port)));
  }

  @State("products exist")
  void productsExist() {
    productRepository.save(new Product(1L, "Widget", "PRODUCT"));
  }

  @State("no products exist")
  void noProductsExist() {
    productRepository.deleteAll();
  }
}
```

**System properties for publishing**:

```
-Dpact.provider.version=$GIT_COMMIT
-Dpact.provider.branch=$GIT_BRANCH
-Dpact.verifier.publishResults=true
```

---

## Ruby (pact-ruby)

### Consumer Tests

```ruby
require 'pact/consumer/rspec'

Pact.service_consumer "ProductsConsumer" do
  has_pact_with "ProductsProvider" do
    mock_service :products_service do
      port 1234
    end
  end
end

describe ProductsClient do
  before do
    products_service.upon_receiving("a request for all products")
      .with(method: :get, path: '/products')
      .will_respond_with(
        status: 200,
        headers: { 'Content-Type' => 'application/json' },
        body: Pact.each_like({
          id: Pact.like(1),
          name: Pact.like('Widget'),
          type: Pact.term(generate: 'PRODUCT', matcher: /^[A-Z]+$/)
        })
      )
  end

  it 'returns a list of products' do
    products = subject.get_products
    expect(products).not_to be_empty
  end
end
```

### Provider Verification (Ruby)

```ruby
# spec/service_consumers/pact_helper.rb
require 'pact/provider/rspec'

Pact.service_provider "ProductsProvider" do
  app_version ENV['GIT_COMMIT']
  app_version_branch ENV['GIT_BRANCH']
  publish_verification_results ENV['CI'] == 'true'

  honours_pacts_from_pact_broker do
    pact_broker_base_url 'https://yourorg.pactflow.io',
      { token: ENV['PACT_BROKER_TOKEN'] }

    consumer_version_selectors [
      { main_branch: true },
      { matching_branch: true },
      { deployed_or_released: true }
    ]

    enable_pending true
    include_wip_pacts_since ENV['GIT_BRANCH'] == 'main' ? '2020-01-01' : nil
  end
end

# Provider states
Pact.provider_states_for "ProductsConsumer" do
  provider_state "products exist" do
    set_up { Product.create!(id: 1, name: 'Widget', type: 'PRODUCT') }
    tear_down { Product.delete_all }
  end
end
```

---

## CLI Tooling

Language-agnostic CLI tools available for all Pact implementations:

| Tool                                 | Use                                                         |
| ------------------------------------ | ----------------------------------------------------------- |
| `pact-broker publish`                | Publish pact files to Pact Broker                           |
| `pact-broker can-i-deploy`           | Check deployment safety                                     |
| `pact-broker record-deployment`      | Record deployment to environment                            |
| `pact-broker record-release`         | Record a release (mobile/libraries)                         |
| `pact-broker create-environment`     | Set up environments                                         |
| `pactflow publish-provider-contract` | Publish OpenAPI spec for BDCT                               |
| `pact-stub-server`                   | Serve pact files as HTTP stubs                              |
| `pact-verifier`                      | Verify pacts against a running provider (language-agnostic) |

Install via (see [docs.pact.io/implementation_guides/cli](https://docs.pact.io/implementation_guides/cli#-installation-methods) for full details):

```bash
# Linux/macOS/WSL (recommended: Unified CLI)
curl -fsSL https://raw.githubusercontent.com/pact-foundation/pact-cli/main/install.sh | sh

# Homebrew (macOS/Linux)
brew tap pact-foundation/tap
brew install pact-foundation/tap/pact

# Windows (PowerShell)
iwr -useb https://raw.githubusercontent.com/pact-foundation/pact-cli/main/install.ps1 | iex

# Windows (Scoop)
scoop bucket add pact https://github.com/pact-foundation/scoop
scoop install pact

# Cargo (Rust)
cargo install pact

# Docker
docker run --rm -it pactfoundation/pact:latest
# or via GitHub Container Registry
docker run --rm -it ghcr.io/pact-foundation/pact:latest
```

```yaml
# GitHub Actions
- uses: pact-foundation/pact-cli@main
- name: Run Pact CLI
  run: pact --help
```

See `references/pact-broker-setup.md` for full CLI command reference.
