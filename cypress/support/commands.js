// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { constructPactFile } from './utils'

Cypress.Commands.add('usePactIntercept', (routeMatcher, staticResponse, nickname) => {
  cy.intercept(
    {
      ...routeMatcher
    },
    {
      ...staticResponse
    }
  ).as(nickname)
})

Cypress.Commands.add('usePactWait', (nickname) => {
  cy.wait(`@${nickname}`).then((response) => {
      const testCaseTitle = Cypress.currentTest.title
      const providerName = process.env.PACT_CONSUMER || 'consumer'
      const consumerName = process.env.PACT_PROVIDER || 'provider'
      const data = constructPactFile(response, testCaseTitle, providerName, consumerName)
      cy.writeFile(`cypress/pacts/${providerName}-${consumerName}.json`, JSON.stringify(data))
    })
})
