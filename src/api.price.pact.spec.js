import { Pact } from '@pact-foundation/pact';
import { API } from './api';
import { like, regex } from '@pact-foundation/pact/dsl/matchers';

const mockProvider = new Pact({
  consumer: 'pactflow-example-price-consumer',
  provider: process.env.PACT_PROVIDER ? process.env.PACT_PROVIDER : 'pactflow-example-provider',
});

describe('API Pact Price test', () => {
  beforeAll(() => mockProvider.setup());

  afterEach(() => mockProvider.verify());

  afterAll(() => mockProvider.finalize());

  describe('retrieving a price', () => {
    test('ID 10 exists', async () => {
      // Arrange
      const expectedPrice = { id: '10', value: '10' }

      await mockProvider.addInteraction({
        state: 'a price with ID 10 exists',
        uponReceiving: 'a request to get a price',
        withRequest: {
          method: 'GET',
          path: '/price/10',
          headers: {
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z'),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': regex({generate: 'application/json; charset=utf-8', matcher: 'application/json;?.*'}),
          },
          body: like(expectedPrice),
        },
      });

      // Act
      const api = new API(mockProvider.mockService.baseUrl);
      const price = await api.getPrice('10');

      // assert that we got the expected response
      expect(price).toStrictEqual(expectedPrice);
    });
  });
});
