# Example Consumer

See the main branch for background, prerequisites and more.

### Pre-requisites

**Software**:

* Tools listed at: https://docs.pactflow.io/docs/workshops/ci-cd/set-up-ci/prerequisites/
* A pactflow.io account with an valid [API token](https://docs.pactflow.io/docs/getting-started/#configuring-your-api-token)
* `pactflow-ai` installed 
  * Quick install: `curl https://download.pactflow.io/ai/get.sh | sh`
  * [Instructions](https://docs.pactflow.io/docs/ai/quick-start)

#### Environment variables

You will need to export the following environment variables into your shell:

* `PACT_BROKER_TOKEN`: a valid [API token](https://docs.pactflow.io/docs/getting-started/#configuring-your-api-token) for PactFlow
* `PACT_BROKER_BASE_URL`: a fully qualified domain name with protocol to your pact broker e.g. https://testdemo.pactflow.io

### AI Demo

#### Recommended arguments

The best output combines the input of code + the OAD (comprehension of the system), a code template (to produce consistent output) and additional instructions (use-case specific guidance):
```
pactflow-ai generate \
  --output ./src/api.pact.spec.ts \
  --language typescript \
  --openapi ./products.yml \
  --endpoint "/product/{id}" \
  --code ./src/product.js \
  --code ./src/api.js \
  --template ./src/pact.test.template \
  --instructions "Write test cases for the positive (HTTP 200) scenario and negative scenarios, specifically the case of 400, 401 and 404"
```

#### Other variations

**With OpenAPI + Code**
```
pactflow-ai generate \
  --output ./src/api.pact.spec.ts \
  --language typescript \
  --openapi ./products.yml \
  --endpoint "/products" \
  --code ./src/product.js \
  --code ./src/api.js
```

**With Code**
```
pactflow-ai generate \
  --output ./src/api.pact.spec.ts \
  --language typescript \
  --code ./src/product.js \
  --code ./src/api.js
```

**With OpenAPI**
```
pactflow-ai generate \
  --output ./src/api.pact.spec.ts \
  --language typescript \
  --openapi ./products.yml \
  --endpoint "/products" \
  --code ./src/product.js \
  --code ./src/api.js
```

**With HTTP captures**
```
pactflow-ai generate \
  --request ./capture/get.request.http \
  --response ./capture/get.response.http \
  --language typescript \
  --output ./src/api.pact.spec.ts
```  

**With a test template**
```
pactflow-ai generate \
  --output ./src/api.pact.spec.ts \
  --language typescript \
  --code ./src/product.js \
  --code ./src/api.js \
  --template ./src/pact.test.template
```

**With additional instructions (inline)**
```
pactflow-ai generate \
  --output ./src/api.pact.spec.ts \
  --language typescript \
  --code ./src/product.js \
  --code ./src/api.js \
  --template ./src/pact.test.template \
  --instructions "Write test cases for the positive (HTTP 200) scenario and negative scenarios, specifically the case of 400, 401 and 404"
```

**With additional instructions (as a file)**
```
pactflow-ai generate \
  --output ./src/api.pact.spec.ts \
  --language typescript \
  --code ./src/product.js \
  --code ./src/api.js \
  --template ./src/pact.test.template \
  --instructions ./src/test.instructions.txt
```

### Running Tests

* `npm run test:pact`