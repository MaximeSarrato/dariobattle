import server from '../server';
import * as request from 'supertest';

describe('server', () => {
  it('should return 200', (done) => {
    request(server)
      .get('/reset')
      .expect(200, done);
  });
});

afterAll(() => server.close());
