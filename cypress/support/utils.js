export const constructPactFile = (intercept, testTitle) => {
  const pactSkeletonObject = {
    consumer: { name: process.env.PACT_CONSUMER || 'consumer' },
    provider: { name: process.env.PACT_PROVIDER || 'provider' },
    interactions: [],
    metadata: {
      pactSpecification: {
        version: '2.0.0'
      }
    }
  }

  const pact = {
    ...pactSkeletonObject,
    interactions: [
      ...pactSkeletonObject.interactions,
      {
        description: testTitle,
        request: {
          method: intercept.request.method,
          path: intercept.request.path,
          body: intercept.request.body
        },
        response: {
          status: intercept.response.status,
          body: intercept.response.body
        }
      }
    ]
  }

  //const path = new URL(intercept.request.url).pathname

  return pact
}
