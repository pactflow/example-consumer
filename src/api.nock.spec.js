import { API } from "./api";
import { convertNockToPact } from "./api.record.spec";

const nockBack = require("nock").back;
nockBack.setMode("lockdown"); // don't allow new recording!
nockBack.fixtures = "fixtures";

describe("API Nock Tests", () => {
  // convert the fixture file into a pact contract after testing
  afterAll(() => convertNockToPact())

  test("nock replay tests", (done) => {
    // reuse the nock fixture
    nockBack(
      "nock.json",
      async function(nockDone ) {
        const api = new API("http://localhost:3000");

        // Test 1
        const products = await api.getAllProducts();
        expect(products.length).toBeGreaterThan(0);

        // Test 2
        // Comment this out, and the test should fail, not serialising the contract
        const product = await api.getProduct("10");
        expect(product.id).toBe("10");

        // This will fail if not all mocks were tested
        // meaning we won't serialise unused items into the contract
        this.assertScopesFinished();

        nockDone();
        done()
      }
    );
  });
});
