# Example Consumer

![Build](https://github.com/pactflow/example-consumer/workflows/Build/badge.svg)

[![Pact Status](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest/badge.svg?label=provider)](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest) (latest pact)

[![Can I deploy Status](https://test.pactflow.io/pacticipants/pactflow-example-consumer/branches/master/latest-version/can-i-deploy/to-environment/production/badge)](https://test.pactflow.io/pacticipants/pactflow-example-consumer/branches/master/latest-version/can-i-deploy/to-environment/production/badge)

This is an example of a Node consumer using Pact to create a consumer driven contract, and sharing it via [Pactflow](https://pactflow.io).

It is using a public tenant on Pactflow, which you can access [here](https://test.pactflow.io/) using the credentials `dXfltyFMgNOFZAxr8io9wJ37iUpY42M`/`O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`. The latest version of the Example Consumer/Example Provider pact is published [here](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest).

The project uses a Makefile to simulate a very simple build pipeline with two stages - test and deploy.

* Test
  * Run tests (including the pact tests that generate the contract)
  * Publish pacts, tagging the consumer version with the name of the current branch
  * Check if we are safe to deploy to prod (ie. has the pact content been successfully verified)
* Deploy (only from master)
  * Deploy app (just pretend for the purposes of this example!)
  * Record the deployment in the Pact Broker

## Usage

See the [Pactflow CI/CD Workshop](https://github.com/pactflow/ci-cd-workshop).

### Pre-requisites

**Software**:

* Tools listed at: https://docs.pactflow.io/docs/workshops/ci-cd/set-up-ci/prerequisites/
* A pactflow.io account with an valid [API token](https://docs.pactflow.io/docs/getting-started/#configuring-your-api-token)


#### Environment variables

To be able to run some of the commands locally, you will need to export the following environment variables into your shell:

* `PACT_BROKER_TOKEN`: a valid [API token](https://docs.pactflow.io/docs/getting-started/#configuring-your-api-token) for Pactflow
* `PACT_BROKER_BASE_URL`: a fully qualified domain name with protocol to your pact broker e.g. https://testdemo.pactflow.io

### Usage

#### Pact use case

* `make test` - run the pact test locally
* `make fake_ci` - run the CI process locally