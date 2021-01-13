const path = require("path")
const chai = require("chai")
const { Pact, Publisher } = require("@pact-foundation/pact")
const expect = chai.expect;
import API from "./api";


describe("Product API", () => {
  let url = "http://localhost";
  const port = 8080;

  const provider = new Pact({
    consumer: "MyConsumer",
    provider: "MyProvider",
    log: path.resolve(process.cwd(), "logs", "pact.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    pactfileWriteMode: "merge",
    spec: 2,
    url: url,
    port: port
  });

  const opts = {
    pactBroker: "http://localhost:81",
    consumerVersion: "9.2",
    pactFilesOrDirs: [path.resolve(process.cwd(), "pacts")],
    publishVerificationResults: true,
    providerVersion: "4.0",
    providerVersionTag: "test1234"
  }

  // this is the response you expect from your Provider
  const EXPECTED_BODY = [
    { id: '09', type: 'CREDIT_CARD', name: 'Gem Visa', version: 'v1' },
    { id: '10', type: 'CREDIT_CARD', name: '28 Degrees', version: 'v1' },
    { id: '11', type: 'PERSONAL_LOAN', name: 'MyFlexiPay', version: 'v2' }
  ];

  // Setup the provider
  before(() => provider.setup());

  describe("get /products", () => {
    before(async () => {
      const interaction = {
        state: "i have a list of products",
        uponReceiving: "a request for all products",
        withRequest: {
          method: "GET",
          path: "/products",
          headers: {
            Accept: "application/json",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: EXPECTED_BODY,
        },
      }

      const interaction2 = {
        state: "i have a list of products",
        uponReceiving: "a request for product 10",
        withRequest: {
          method: "GET",
          path: "/product/10",
          headers: {
            Accept: "application/json",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: EXPECTED_BODY[1],
        },
      }
      await provider.addInteraction(interaction);
      await provider.addInteraction(interaction2);
    });

    it("returns the correct response", async () => {
      const urlAndPort = {
        url: url,
        port: port,
      }
      let res = await API.getAllProducts(urlAndPort);
      expect(res.data).to.deep.equal(EXPECTED_BODY);
    });

    it("returns the correct response 2", async () => {
      const urlAndPort = {
        url: url,
        port: port,
      }
      let res = await API.getProduct(urlAndPort);
      expect(res.data).to.deep.equal(EXPECTED_BODY[1]);
    });
  });

  after("Verify, finalize and publish Pacts", () => {
    provider.verify()
    provider.finalize();  
    // new Publisher(opts).publishPacts().then(() => {
    //   console.log("Pacts published")
    // })
  });
});