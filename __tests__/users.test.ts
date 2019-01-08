import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import App from '../app';
import * as mongoose from 'mongoose';
import UsersController from '../controllers/users.controller';
import User from '../models/User';
import { IUserDocument } from '../interfaces/IUserDocument';
import { rejects } from 'assert';
import logger from '../services/logger';

const app = new App([new UsersController()]).app;

beforeAll(() => {
  mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true },
  );
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
const randomUserObjectId = mongoose.Types.ObjectId();

/**
 * Create a temporary user that will be deleted after next test.
 */
async function createTemporaryUser(): Promise<IUserDocument> {
  const hash = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    password: hash,
    createdAt: Date.now(),
  });
  await user.save();
  return Promise.resolve(user);
}

/**
 * Log the temporary user and get his token.
 */
function loginAndGetToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    request(app)
      .post('/users/login')
      .send({ username, password })
      .end((err, res) => {
        if (err) {
          return reject('Impossible to get token.' + err);
        } else if (res.header['x-auth']) {
          return resolve(res.header['x-auth']);
        }
        return reject('Impossible to get token.');
      });
  });
}

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

describe('POST /users/login', () => {
  it('should return 403 on empty body request', (done) => {
    request(app)
      .post('/users/login')
      .send({})
      .expect(403, done);
  });
  it('should return 403 on missing username', (done) => {
    request(app)
      .post('/users/login')
      .send({ password })
      .expect(403, done);
  });
  it('should return 403 on missing password', (done) => {
    request(app)
      .post('/users/login')
      .send({ username })
      .expect(403, done);
  });
  it('should return 404 on not found user', (done) => {
    request(app)
      .post('/users/login')
      .send({ username, password })
      .expect(404, done);
  });
  it('should log in user successfully', async (done) => {
    const user = await createTemporaryUser();
    request(app)
      .post('/users/login')
      .send({ username, password })
      .expect((res) => {
        const token = res.header['x-auth'];
        expect(token).toBeTruthy();
      })
      .expect(200, done);
  });
  it('should return 403 on wrong password', async (done) => {
    const wrongPassword = 'abc123';
    const user = await createTemporaryUser();
    request(app)
      .post('/users/login')
      .send({ username, password: wrongPassword })
      .expect(403, done);
  });
});
describe('GET /users/:id', () => {
  it('should return 400 on invalid id', async (done) => {
    const invalidUserId = 'abc123';
    await createTemporaryUser();
    let token;
    try {
      token = await loginAndGetToken();
    } catch (e) {
      logger.error(e);
    }
    expect(token).toBeTruthy();
    request(app)
      .get(`/users/${invalidUserId}`)
      .set('x-auth', token)
      .expect(400, done);
  });
  it('should return 404 on not found user', async (done) => {
    await createTemporaryUser();
    let token;
    try {
      token = await loginAndGetToken();
    } catch (e) {
      logger.error(e);
    }
    expect(token).toBeTruthy();
    request(app)
      .get(`/users/${randomUserObjectId}`)
      .set('x-auth', token)
      .expect(404, done);
  });
  it('should get the user data', async (done) => {
    const user = await createTemporaryUser();
    let token;
    try {
      token = await loginAndGetToken();
    } catch (e) {
      return done(e);
    }
    expect(token).toBeTruthy();
    request(app)
      .get(`/users/${user._id}`)
      .set('x-auth', token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.username).toBe(username);
        expect(res.body.token).toBe(token);
        expect(res.body._id).toBe(mongoose.Types.ObjectId(user._id).toString());
        done();
      });
  });
});
