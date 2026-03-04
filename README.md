# Example Consumer

[![Build](https://github.com/pactflow/example-consumer/actions/workflows/build.yml/badge.svg)](https://github.com/pactflow/example-consumer/actions/workflows/build.yml)

[![Pact Status](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest/badge.svg?label=provider)](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest) (latest pact)

[![Can I deploy Status](https://test.pactflow.io/pacticipants/pactflow-example-consumer/branches/master/latest-version/can-i-deploy/to-environment/production/badge)](https://test.pactflow.io/pacticipants/pactflow-example-consumer/branches/master/latest-version/can-i-deploy/to-environment/production/badge)

This is an example of a Node consumer using Pact to create a consumer driven contract, and sharing it via [PactFlow](https://pactflow.io).

It is using a public tenant on PactFlow, which you can access [here](https://test.pactflow.io/) using the credentials `dXfltyFMgNOFZAxr8io9wJ37iUpY42M`/`O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`. The latest version of the Example Consumer/Example Provider pact is published [here](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest).

The project uses a Makefile to simulate a very simple build pipeline with two stages - test and deploy.

* Test
  * Run tests (including the pact tests that generate the contract)
  * Publish pacts, associating the consumer version with the name of the current branch
  * Check if we are safe to deploy to prod (ie. has the pact content been successfully verified)
* Deploy (only from master)
  * Deploy app (just pretend for the purposes of this example!)
  * Record the deployment in the Pact Broker

## Tech Stack

| Concern          | Tool       |
| ---------------- | ---------- |
| Build            | Vite       |
| Language         | TypeScript |
| Test runner      | Vitest     |
| Linter/formatter | Biome      |
| UI framework     | React      |

## Prerequisites

**Node.js ≥ 24** is required.

Other tools: see https://docs.pactflow.io/docs/workshops/ci-cd/set-up-ci/prerequisites/

A [PactFlow](https://pactflow.io) account with a valid [API token](https://docs.pactflow.io/#configuring-your-api-token).

## Usage

See the [PactFlow CI/CD Workshop](https://github.com/pactflow/ci-cd-workshop).

## Running the application

Start up the [provider](https://github.com/pactflow/example-provider/) (or another [compatible](https://docs.pactflow.io/docs/examples) provider) API.

Open a separate terminal for the consumer.

Before starting the consumer, create a `.env` file in the root of the project (use `.env.example` as a template) and set the URL to point to your running provider:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Then run:

```bash
npm run dev
```

## Scripts

| Script               | Description                            |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Start the Vite dev server on port 3000 |
| `npm run build`      | Production build (output: `build/`)    |
| `npm run preview`    | Preview the production build           |
| `npm test`           | Run all tests with Vitest              |
| `npm run test:pact`  | Run pact tests only                    |
| `npm run type-check` | TypeScript type checking (no emit)     |
| `npm run lint`       | Biome lint                             |
| `npm run format`     | Biome format check                     |
| `npm run check`      | Biome lint + format check              |
| `npm run check:fix`  | Auto-fix all Biome issues              |

## Environment variables

| Variable               | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL`    | Base URL of the provider API (default: `http://localhost:8080`) |
| `PACT_BROKER_TOKEN`    | Valid API token for PactFlow                                    |
| `PACT_BROKER_BASE_URL` | Fully qualified domain with protocol to your pact broker        |

## Pact use cases

* `make test` — run the pact test locally
* `make fake_ci` — run the CI process locally
