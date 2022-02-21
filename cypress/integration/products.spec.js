const productsResponse = require('../fixtures/products.json')

describe('products page', () => {
  beforeEach(() => {
    cy.usePactIntercept(
      {
        method: 'GET',
        url: 'http://localhost:3001/products'
      },
      {
        statusCode: 200,
        body: productsResponse,
        headers: { 'access-control-allow-origin': '*' }
      },
      'getProducts'
    )

    cy.visit('http://localhost:3000/products')
  })

  it('displays products', () => {
    cy.usePactWait('getProducts')
    cy.get('.product-item').its('length').should('eq', 3)
  })
})
