const productResponse = require('../fixtures/product.json')

describe('product page', () => {
  beforeEach(() => {
    cy.usePactIntercept(
      {
        method: 'GET',
        url: '**/product/*'
      },
      {
        statusCode: 200,
        body: { ...productResponse },
        headers: { 'access-control-allow-origin': '*' }
      },
      'getProduct'
    )

    cy.visit('http://localhost:3000/products/09')
  })

  it('displays product item', () => {
      cy.usePactWait('getProduct')

    // cy.get('.product-id').contains('09')
    // cy.get('.product-name').contains('Gem Visa')
    // cy.get('.product-type').contains('CREDIT_CARD')
  })
})
