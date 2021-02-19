import { API } from "./api";
import * as fs from "fs";

const nockBack = require("nock").back;
nockBack.setMode("record");
nockBack.fixtures = "fixtures"

describe("API Nock Tests", () => {
  test("nock recordings", () => {
    // recording of the fixture
    return nockBack("nock.json", { afterRecord: convertToPact }).then(
      async ({ nockDone }) => {
        const api = new API("http://localhost:3000");

        // Record all of the data
        await api.getAllProducts();
        await api.getProduct("10");

        nockDone();
      }
    );
  });
});

// Crude converter from a nock fixture to a pactfile
export const convertToPact = (scopes) => {
  const pact = {
    consumer: { name: "pactflow-example-consumer" },
    provider: { name: "collaborative-contracts-provider" },
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
  console.log(scopes);

  fs.writeFileSync("./pacts/nock-contract.json", JSON.stringify(pact));
  return scopes;
};