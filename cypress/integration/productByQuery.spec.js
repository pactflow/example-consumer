const productResponse = require('../fixtures/products.json')

describe('product page', () => {
  beforeEach(() => {
    cy.usePactIntercept(
      {
        url: 'http://localhost:3001/products*',
        query: {
          id: '2'
        }
      },
      {
        statusCode: 200,
        body: productResponse,
        headers: { 'access-control-allow-origin': '*' }
      },
      'getProductById'
    )

    cy.visit('http://localhost:3000/products?id=2')
  })

  it('displays product item by query', () => {
    cy.usePactWait('getProductById')

    // cy.get('.product-id').contains('09')
    // cy.get('.product-name').contains('Gem Visa')
    // cy.get('.product-type').contains('CREDIT_CARD')
  })
})
