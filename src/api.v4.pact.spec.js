import { API } from "./api";
import { Matchers, Pact, SpecificationVersion } from "@pact-foundation/pact";
import { Product } from "./product";

const {
  eachLike,
  like,
} = Matchers;

const pact = new Pact({
  consumer: "pactflow-example-consumer-v4",
  provider: process.env.PACT_PROVIDER
    ? process.env.PACT_PROVIDER
    : "pactflow-example-provider-v4",
  spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
});

describe("API Pact v4 test", () => {
  describe("retrieving a product", () => {
    test("ID 10 exists", async () => {
      // Arrange

      const product10Object = {
        id: "10",
        name: "28 Degrees",
        type: "CREDIT_CARD",
      }
      const expectedProduct10 = like(product10Object);

      // Uncomment to see this fail
      // const expectedProduct = { id: '10', type: 'CREDIT_CARD', name: '28 Degrees', price: 30.0, newField: 22}

      await pact
        .addInteraction()
        .given("a product with ID 10 exists")
        .uponReceiving("a request to get a product")
        .withRequest("GET", `/product/10`, (builder) => {
          builder.headers({
            Accept: like("application/json"),
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ "Content-Type": like("application/json") });
          builder.jsonBody(expectedProduct10);
        })
        .executeTest(async (mockserver) => {
          // Act
          const api = new API(mockserver.url);
          const product = await api.getProduct(10);

          // Assert - did we get the expected response
          expect(product).toEqual(new Product(product10Object));
        });
    });

    test("product does not exist", async () => {
      const expectedError = like({ error: "Not Found" })

      await pact
        .addInteraction()
        .given("a product with ID 11 does not exist")
        .uponReceiving("a request to get a product")
        .withRequest("GET", `/product/11`, (builder) => {
          builder.headers({
            Accept: like("application/json"),
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          });
        })
        .willRespondWith(404, (builder) => {
          builder.headers({ "Content-Type": like("application/json") });
          builder.jsonBody(expectedError);
        })
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);

          const error = await api.getProduct("11")

          // make request to Pact mock server
          expect(error).toEqual({ error: "Request failed with status code 404", status: 404 });
        });
    });
  });

  describe("retrieving products", () => {
    test("products exists", async () => {
      // set up Pact interactions

      const productsObject = {
        id: "10",
        type: "CREDIT_CARD",
        name: "28 Degrees",
        keywords: ["28 Degrees", "personal", "credit", "cc"],
      }

      const expectedProducts = eachLike(productsObject);

      await pact
        .addInteraction()
        .given("products exist")
        .uponReceiving("a request to get all products")
        .withRequest("GET", `/products`, (builder) => {
          builder.headers({
            Accept: like("application/json"),
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ "Content-Type": like("application/json") });
          builder.jsonBody(expectedProducts);
        })
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);

          // make request to Pact mock server
          const products = await api.getAllProducts();

          // assert that we got the expected response
          expect(products).toEqual([new Product(productsObject)]);
        });
    });
  });

  describe("search products by keyword", () => {
    test("matching products returned", async () => {
      // set up Pact interactions

      const productObject = {
        id: "11",
        type: "HOME_LOAN",
        name: "MyFlexiMortgage",
        keywords: [
          "loan",
          "property",
          "home",
          "house",
          "personal",
          "finance",
          "flexi",
        ],
      }

      const expectedProducts = eachLike(productObject);

      await pact
        .addInteraction()
        .given("products with keywords exist")
        .uponReceiving("a request to search products by keyword")
        .withRequest("GET", `/keywordSearch/house`, (builder) => {
          builder.headers({
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({
            "Content-Type": like("application/json"),
          });
          builder.jsonBody(expectedProducts);
        })
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);

          // make request to Pact mock server
          const results = await api.keywordSearch("house");

          // assert that we got the expected response
          expect(results).toEqual([new Product(productObject)]);
        });
    });
  });
});
