import * as request from 'supertest';
import { Router } from 'express';
import App from '../app';
import Controller from '../interfaces/controller.interface';

const controller: Controller = {
  path: '/randomPath',
  router: Router()
};

const app = new App([controller]).app;

describe('GET /random-url', () => {
  it('should return 200', done => {
    request(app)
      .get('/reset')
      .expect(200, done);
  });
});
