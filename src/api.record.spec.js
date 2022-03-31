import { API } from "./api";
import * as path from "path";
import * as fs from "fs";

const nockBack = require("nock").back;
nockBack.setMode("record"); // record interactions
nockBack.fixtures = "fixtures"; // fixture files will be stored in ./fixtures/<fixture>.json
const filename = "nock.json";

describe("API Nock Tests", () => {
  test("nock recordings", () => {
    // recording of the fixture
    return nockBack(filename).then(async ({ nockDone }) => {
      const api = new API("http://localhost:3001");

      // Record all of the data
      await api.getAllProducts();
      await api.getProduct("10");

      nockDone();
    });
  });
});

// Crude converter from a nock fixture to a pactfile
export const convertNockToPact = () => {
  const scopes = require(path.join(
    __dirname,
    "..",
    nockBack.fixtures,
    filename
  ));

  const pact = {
    consumer: { name: "pactflow-example-consumer-nock" },
    provider: {
      name: process.env.PACT_PROVIDER
        ? process.env.PACT_PROVIDER
        : "pactflow-example-provider-dredd",
    },
    interactions: [],
    metadata: {
      pactSpecification: {
        version: "2.0.0",
      },
    },
  };

  pact.interactions = scopes.map((interaction) => {
    return {
      description: `nock_${interaction.method}_${interaction.path}_${interaction.status}`,
      request: {
        method: interaction.method,
        path: interaction.path,
        body: interaction.body,
      },
      response: {
        status: interaction.status,
        body: interaction.response,
      },
    };
  });

  try {
    fs.mkdirSync(path.join(__dirname, "..", "pacts"));
  } catch (e) {
    // writeFileSync fails if dir doesnt exist
    // mkdirSync fails if dir exists
  }
  fs.writeFileSync(
    path.join(__dirname, "..", "pacts", "nock-contract.json"),
    JSON.stringify(pact)
  );

  return scopes;
};
