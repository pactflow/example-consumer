import { uniqBy } from 'lodash'
export const constructPactFile = (intercept, testTitle, content) => {
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

  const path = new URL(intercept.request.url).pathname
  if (content) {
    const interactions = [
      ...content.interactions,
      {
        description: testTitle,
        request: {
          method: intercept.request.method,
          path: path,
          headers: intercept.request.headers,
          body: intercept.request.body
        },
        response: {
          status: intercept.response.status,
          headers: intercept.response.headers,
          body: intercept.response.body
        }
      }
    ]

    const nonDuplicatesInteractions = uniqBy(interactions, 'description')
    const data = {
      ...pactSkeletonObject,
      ...content,
      interactions: nonDuplicatesInteractions
    }
    return data
  }

  return {
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
}
