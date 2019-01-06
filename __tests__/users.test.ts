import * as request from 'supertest';
import App from '../app';
import * as mongoose from 'mongoose';
import UsersController from '../controllers/users.controller';
import User from '../models/User';

const app = new App([new UsersController()]).app;

beforeAll(() => {
  mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true },
  );

  console.log(process.env.MONGO_URI);
});

afterAll(() => {
  mongoose.disconnect();
});

afterEach(async (done) => {
  const user = await User.findOne({ username });
  if (user) {
    await user.remove();
    done();
  } else {
    done();
  }
});

const username = 'testUsername';
const password = 'testPassword';

describe('POST /users/signup', () => {
  it('should return 403 on empty body request', (done) => {
    request(app)
      .post('/users/signup')
      .send({})
      .expect(403, done);
  });
  it('should return 403 on missing username', (done) => {
    request(app)
      .post('/users/signup')
      .send({ password })
      .expect(403, done);
  });
  it('should return 403 on missing password', (done) => {
    request(app)
      .post('/users/signup')
      .send({ username })
      .expect(403, done);
  });
  it('should create a new user', (done) => {
    request(app)
      .post('/users/signup')
      .send({ username, password })
      .expect(200, done);
  });
  it('should return 403 on existing username', async (done) => {
    const user = new User({
      username,
      password,
      createdAt: Date.now(),
    });

    await user.save();

    request(app)
      .post('/users/signup')
      .send({ username, password })
      .expect(403, done);
  });
});
