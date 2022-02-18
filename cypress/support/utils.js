import { uniqBy } from 'lodash'

const constructHeadersForPact = (headers) => {
  return {
    authorization: headers.authorization,
    'content-type': headers['content-type']
  }
}
const constructInteraction = (intercept, testTitle) => {
  const path = new URL(intercept.request.url).pathname
  const search = new URL(intercept.request.url).search
  const query = new URLSearchParams(search).toString()
  return {
    description: testTitle,
    providerState: '',
    request: {
      method: intercept.request.method,
      path: path,
      headers: constructHeadersForPact(intercept.request.headers),
      body: intercept.request.body,
      query: query
    },
    response: {
      status: intercept.response.status,
      headers: constructHeadersForPact(intercept.response.headers),
      body: intercept.response.body
    }
  }
}
export const constructPactFile = (intercept, testTitle, content) => {
    console.log('intercept', intercept)
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

  if (content) {
    const interactions = [...content.interactions, constructInteraction(intercept, testTitle)]
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
    interactions: [...pactSkeletonObject.interactions, constructInteraction(intercept, testTitle)]
  }
}
