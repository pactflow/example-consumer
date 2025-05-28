import { SpecificationVersion, PactV4, MatchersV3 } from "@pact-foundation/pact";
import { API } from './api';

const { like } = MatchersV3;

describe("Product API", () => {
  const pact = new PactV4({
    consumer: "ProductConsumer",
    provider: "ProductProvider",
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    logLevel: "error",
  });

  describe("GET /product/:id", () => {
    test("given a valid product, returns 200", async () => {
      await pact
        .addInteraction()
        .given("a product with id 1234 exists")
        .uponReceiving("a request for a valid product")
        .withRequest("GET", "/product/1234", (builder) => {
          builder.headers({ Accept: "application/json; charset=utf-8" });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody(
            like({
              id: "1234",
              name: "Product Name",
              type: "food",
            })
          );
        })
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);
          const product = await api.getProduct("1234");
          expect(product).toEqual({
            id: "1234",
            name: "Product Name",
            type: "food",
          });
        });
    });

    test("given a non-existent product, returns 404", async () => {
      await pact
        .addInteraction()
        .given("no product with id 9999 exists")
        .uponReceiving("a request for a non-existent product")
        .withRequest("GET", "/product/9999", (builder) => {
          builder.headers({ Accept: "application/json; charset=utf-8" });
        })
        .willRespondWith(404)
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);
          await expect(api.getProduct("9999")).rejects.toThrow();
        });
    });

    test("given an invalid product id, returns 400", async () => {
      await pact
        .addInteraction()
        .uponReceiving("a request with an invalid product id")
        .withRequest("GET", "/product/invalid-id", (builder) => {
          builder.headers({ Accept: "application/json; charset=utf-8" });
        })
        .willRespondWith(400)
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);
          await expect(api.getProduct("invalid-id")).rejects.toThrow();
        });
    });

    test("given no authorization, returns 401", async () => {
      await pact
        .addInteraction()
        .uponReceiving("a request without authorization")
        .withRequest("GET", "/product/1234", (builder) => {
          builder.headers({ Accept: "application/json; charset=utf-8" });
        })
        .willRespondWith(401)
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);
          await expect(api.getProduct("1234")).rejects.toThrow();
        });
    });
  });

  describe("GET /products", () => {
    test("returns all products with 200", async () => {
      await pact
        .addInteraction()
        .given("products exist")
        .uponReceiving("a request for all products")
        .withRequest("GET", "/products", (builder) => {
          builder.headers({ Accept: "application/json; charset=utf-8" });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody(
            like([
              {
                id: "1234",
                name: "Product Name",
                type: "food",
              },
            ])
          );
        })
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);
          const products = await api.getAllProducts();
          expect(products).toEqual([
            {
              id: "1234",
              name: "Product Name",
              type: "food",
            },
          ]);
        });
    });
  });
});
