import { SpecificationVersion, PactV4, MatchersV3 } from "@pact-foundation/pact";
import { API } from './api';
import { Product } from './product';

const { like } = MatchersV3;

describe("📦 Product API", () => {
  const pact = new PactV4({
    consumer: "AIExampleConsumer",
    provider: "AIExampleProvider",
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    logLevel: "error",
  });

  describe("🔌 GET /products", () => {
    test("🧪 given products exist, returns 200", async () => {
      await pact
        .addInteraction()
        .given("products exist")
        .uponReceiving("a request for all products")
        .withRequest("GET", "/products", (builder) => {
          builder.headers({
            Accept: "application/json",
            Authorization: like("Bearer some-token"),
          });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody(
            like([
              {
                id: "1",
                name: "Product 1",
                type: "Type A",
              },
            ])
          );
        })
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);
          const products = await api.getAllProducts();
          expect(products).toEqual([
            new Product({
              id: "1",
              name: "Product 1",
              type: "Type A",
            }),
          ]);
        });
    });
  });
});
