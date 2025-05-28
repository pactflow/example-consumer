import { API } from "./api";
import { startMockServer, stopMockServer } from "./mockserver";

let mockserver: string;

describe("Product API", () => {
  beforeAll(async () => mockserver = await startMockServer());
  afterAll(() => stopMockServer())

  describe("GET /product/:id", () => {
    test("given a valid product, returns 200", async () => {
      const api = new API(mockserver);
      const product = await api.getProduct("10");
      expect(product).toEqual({
        id: 10,
        name: "cola",
        type: "beverage",
      });
    });

    test("given a non-existent product, returns 404", async () => {
      const api = new API(mockserver);
      await expect(api.getProduct("9999")).rejects.toThrow();
    });

    test("given an invalid product id, returns 400", async () => {
      const api = new API(mockserver);
      await expect(api.getProduct("invalid-id")).rejects.toThrow();
    });

    test("given no authorization, returns 401", async () => {
      const api = new API(mockserver);
      api.generateAuthToken = jest.fn(() => undefined as any as string);
      await expect(api.getProduct("10")).rejects.toThrow();
    });
  });

  describe.skip("GET /products", () => {
    test("returns all products with 200", async () => {
      const api = new API(mockserver);
      try {
        const products = await api.getAllProducts();
        console.log(products);
        expect(products).toContain([
          {
            id: 10,
            name: "cola",
            type: "beverage",
          },
        ]);
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    });
  });
});
