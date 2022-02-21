## Example Consumer (cypress)

_NOTE: if you're running the CI/CD workshop, you can ignore this section. This is an extension to the example that demonstrates a new [feature](https://github.com/pactflow/roadmap/issues/4) in developer preview._

This is an example of a React consumer using Cypress to create a consumer driven contract, and sharing it via [Pactflow](https://pactflow.io).

It implements a "Product" website, to demonstrate the new bi-directional contract capability of Pactflow (previously referred to as Provider driven contracts, or collaborative contracts). See the [Provider](https://github.com/pactflow/example-pactflow-example-provider-dredd) counterpart.

It is using a public tenant on Pactflow, which you can access [here](https://test.pact.dius.com.au) using the credentials `dXfltyFMgNOFZAxr8io9wJ37iUpY42M`/`O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`. The latest version of the Example Consumer/Example Provider pact is published [here](https://test.pact.dius.com.au/pacts/provider/pactflow-example-pactflow-example-provider-dredd/consumer/pactflow-example-consumer/latest).

In the following diagram, you can see how the consumer testing process works - it's the same as the current Pact process! (We do show an alternative using Cypress' intercept functionality)

When we call "can-i-deploy" the cross-contract validation process kicks off on Pactflow, to ensure any consumer consumes a valid subset of the OAS for the provider.

![Consumer Test](docs/consumer-scope.png "Consumer Test")

When you run the CI pipeline (see below for doing this), the pipeline should perform the following activities (simplified):

![Consumer Pipeline](docs/consumer-pipeline.png "Consumer Pipeline")

### Pre-requisites

**Software**:

* Tools listed at: https://docs.pactflow.io/docs/workshops/ci-cd/set-up-ci/prerequisites/
* A pactflow.io account with an valid [API token](https://docs.pactflow.io/docs/getting-started/#configuring-your-api-token)


#### Environment variables

To be able to run some of the commands locally, you will need to export the following environment variables into your shell:

* `PACT_BROKER_TOKEN`: a valid [API token](https://docs.pactflow.io/docs/getting-started/#configuring-your-api-token) for Pactflow
* `PACT_BROKER_BASE_URL`: a fully qualified domain name with protocol to your pact broker e.g. https://testdemo.pactflow.io
* `PACT_PROVIDER=pactflow-example-provider-dredd`: this changes the default provider to the Dredd based provider (https://github.com/pactflow/example-provider-dredd)
* `PACT_PROVIDER=pactflow-example-provider-postman`: ... Postman (https://github.com/pactflow/example-provider-postman)
* `PACT_PROVIDER=pactflow-example-provider-restassured`: ... Rest Assured (https://github.com/pactflow/example-provider-restassured)
### Usage

#### Pact use case

* `make test` - run the pact test locally
* `make fake_cypress_ci` - run the Cypress CI process locally

#### BYO Tool use case with Cypress

NOTE: The cypress are already in the project, in the `./cypress` directory, see below for how to start cypress test and generate consumer contract

* `make test_cypress` - run cypress test locally
* `make fake_ci_cypress` - run the nock version of the CI process locally

*Cypress*

You can stubbed your network request and response with `cy.usePactIntercept`, and record network call to a consumer driven contract with `cy.usePactWait`. 

* `npm run cypress:headless:chrome` - this will run cypress e2e test in headless mode, and write stubbed network calls a pact file 
* `npm run cypress:run` - this will run cypress e2e test with browser ui