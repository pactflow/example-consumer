const productResponse = require('../fixtures/product.json')

const constructPactFile = (intercept) => {
    const pact = {
        consumer: { name: "pactflow-example-consumer" },
        provider: { name: process.env.PACT_PROVIDER || "pactflow-example-provider" },
        interactions: [],
        metadata: {
          pactSpecification: {
            version: "2.0.0",
          },
        },
      }

      const path = new URL(intercept.request.url).pathname
    
      pact.interactions = {
          description: `cypress_${intercept.request.method}_${path}_${intercept.response.statusCode}`,
          request: {
            method: intercept.request.method,
            path: intercept.request.path,
            body: intercept.request.body,
          },
          response: {
            status: intercept.response.status,
            body: intercept.response.body,
          },
        
      }
    return pact
}



describe('product page', () => {
    beforeEach(() => {
        cy.intercept({
            method: 'GET',
            url: '**/product/*',
          }, {
            statusCode: 200,
            body: { ...productResponse},
            headers: { 'access-control-allow-origin': '*' },
          }).as('getProduct')
      cy.visit('http://localhost:3000/products/09')
    
    })
  
    it('should handle network', () => {      
        cy.wait('@getProduct').then((response) => {
        const data = constructPactFile(response)
        cy.writeFile('cypress/pact/pact.json', JSON.stringify(data))
        })
    })
    it('displays product item', () => {
      
      cy.get('.product-id').contains('09')
      cy.get('.product-name').contains('Gem Visa')
      cy.get('.product-type').contains('CREDIT_CARD')
    })
  })
  