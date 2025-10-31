import { Pact } from '@pact-foundation/pact';
import { API } from './api';
import { Matchers } from '@pact-foundation/pact';
import { Product } from './product';
const { eachLike, like } = Matchers;

const mockProvider = new Pact({
  consumer: 'pactflow-example-consumer',
  provider: process.env.PACT_PROVIDER
    ? process.env.PACT_PROVIDER
    : 'pactflow-example-provider'
});

describe('API Pact test', () => {
  describe('retrieving a product', () => {
    it('ID 10 exists', async () => {
      // Arrange
      const expectedProduct = {
        id: '10',
        type: 'CREDIT_CARD',
        name: '28 Degrees',
        color: 'red',
      };

      // Uncomment to see this interaction fail on the provider side
      // const expectedProduct = { id: '10', type: 'CREDIT_CARD', name: '28 Degrees', price: 30.0, newField: 22}

      await mockProvider
        .addInteraction()
        .given('a product with ID 10 exists')
        .uponReceiving('a request to get a product')
        .withRequest('GET', '/product/10', (builder) => {
          builder.headers({
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z')
          });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/json; charset=utf-8' });
          builder.jsonBody(like(expectedProduct));
        })
        .executeTest(async (mockserver) => {
        // Act
          const api = new API(mockserver.url);
          const product = await api.getProduct('10');

        // Assert - did we get the expected response
          expect(product).toStrictEqual(new Product(expectedProduct));
          return;
        });
    });

    it('product does not exist', async () => {
      await mockProvider
        .addInteraction()
        .given('a product with ID 11 does not exist')
        .uponReceiving('a request to get a product')
        .withRequest('GET', '/product/11', (builder) => {
          builder.headers({
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z')
          });
        })
        .willRespondWith(404)
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);

          // make request to Pact mock server
          await expect(api.getProduct('11')).rejects.toThrow(
            'Request failed with status code 404'
          );
          return;
        });
    });
  });

  describe('retrieving products', () => {
    it('products exists', async () => {
      // set up Pact interactions
      const expectedProduct = {
        id: '10',
        type: 'CREDIT_CARD',
        name: '28 Degrees'
      };

      await mockProvider
        .addInteraction()
        .given('products exist')
        .uponReceiving('a request to get all products')
        .withRequest('GET', '/products', (builder) => {
          builder.headers({
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z')
          });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/json; charset=utf-8' });
          builder.jsonBody(eachLike(expectedProduct));
        })
        .executeTest(async (mockserver) => {
          const api = new API(mockserver.url);
          // make request to Pact mock server
          const products = await api.getAllProducts();

          // assert that we got the expected response
          expect(products).toStrictEqual([new Product(expectedProduct)]);
          return;
        });
    });
  });
});
