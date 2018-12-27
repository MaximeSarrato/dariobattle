import * as request from 'supertest';
import App from '../app';
import mockingoose from 'mockingoose';
import AuthController from '../controllers/auth.controller';

const app = new App([new AuthController()]).app;

beforeEach(() => {
  mockingoose.resetAll();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('GET /auth/token', () => {
  it('should return 403 on not authenticated user', done => {
    request(app)
      .get('/auth/token')
      .expect(403, done);
  });

  it('should return 404 on unknown token in database', done => {
    mockingoose.User.toReturn({ name: 2 });
    request(app)
      .get('/auth/token')
      .set('x-auth', 'abc123')
      .expect(404, done);
  });
});
