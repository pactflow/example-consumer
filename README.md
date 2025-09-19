# Example Consumer

[![Build](https://github.com/pactflow/example-consumer/actions/workflows/build.yml/badge.svg)](https://github.com/pactflow/example-consumer/actions/workflows/build.yml)

[![Pact Status](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest/badge.svg?label=provider)](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest) (latest pact)

[![Can I deploy Status](https://test.pactflow.io/pacticipants/pactflow-example-consumer/branches/master/latest-version/can-i-deploy/to-environment/production/badge)](https://test.pactflow.io/pacticipants/pactflow-example-consumer/branches/master/latest-version/can-i-deploy/to-environment/production/badge)

This is an example of a Node consumer using Pact to create a consumer driven contract, and sharing it via [PactFlow](https://pactflow.io).

It is using a public tenant on PactFlow, which you can access [here](https://test.pactflow.io/) using the credentials `dXfltyFMgNOFZAxr8io9wJ37iUpY42M`/`O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`. The latest version of the Example Consumer/Example Provider pact is published [here](https://test.pactflow.io/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer/latest).


## Pactflow Onboarding

To simplify the onboarding tutorial, we have created `workshop/pactflow` branch on top of the existing functionality. It's to simplify the onboarding tutorial, allowing user to publish consumer contract without the use of Makefile. If you want to do a full workshop, please refer to the `main` branch to avoid unnecessary setups.

### Pre-requisites

**Software**:

* Git
* Node 16
* Docker
* Bash shell
* A pactflow.io account with an valid [API token](https://docs.pactflow.io/#configuring-your-api-token)

### Create contract

```
# Install dependencies
npm ci

# Run  tests
npm t
```

The contract will be generated in `/pacts` directory if the test runs successfully.


### Publish contract

We will publish contract to a [public tenant](https://test.pactflow.io) on PactFlow. To be able to do it from local environment, you will need to export the following environment variables into your shell:

* `PACT_BROKER_TOKEN`: a valid [API token](https://docs.pactflow.io/#configuring-your-api-token) for PactFlow
* `PACT_BROKER_BASE_URL`: a fully qualified domain name with protocol of public tenant on PactFlow `https://test.pactflow.io`

Alternatively, you can create a `.env` file at the project root folder and put the 2 variables in. ie: 
```
PACT_BROKER_BASE_URL=https://test.pactflow.io
PACT_BROKER_TOKEN=<<whatever-the-token-you-found>>
```

Once you have the environment variables setup, you can publish the contract using the following npm command

```
npm run publish_contracts
```

Keep an eye to the links in the command output after the contracts were published successfully. You will need it shortly to view the contract in the public tenant.
