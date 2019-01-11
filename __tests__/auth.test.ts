import * as request from 'supertest';
import App from '../app';
import AuthController from '../controllers/auth.controller';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import UsersController from '../controllers/users.controller';
import User from '../models/User';
import { IUserDocument } from '../interfaces/IUserDocument';

const app = new App([new UsersController(), new AuthController()]).app;
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
      .then((res) => {
        if (res.header['x-auth']) {
          return resolve(res.header['x-auth']);
        } else {
          return reject(
            'Impossible to find token because header does not exist.',
          );
        }
      })
      .catch((err) => reject('Impossible to get token.' + err));
  });
}

describe('GET /auth/token', () => {
  it('should return 403 on not authenticated user', (done) => {
    request(app)
      .get('/auth/token')
      .expect(403, done);
  });

  it('should return 404 on unknown token in database', (done) => {
    request(app)
      .get('/auth/token')
      .set('x-auth', 'abc123')
      .expect(404, done);
  });
  it('should return token, _id and username on success', async (done) => {
    const user = await createTemporaryUser();
    let token;
    try {
      token = await loginAndGetToken();
    } catch (e) {
      return done(e);
    }

    request(app)
      .get('/auth/token')
      .set('x-auth', token)
      .expect(200)
      .then((response) => {
        expect(response.header['x-auth']).toBe(token);
        expect(response.body.uid).toBe(
          mongoose.Types.ObjectId(user._id).toString(),
        );
        expect(response.body.username).toBe(username);
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /auth/logout', () => {
  it('should logout', async (done) => {
    await createTemporaryUser();
    let token;
    try {
      token = await loginAndGetToken();
    } catch (e) {
      return done(e);
    }

    request(app)
      .get('/auth/logout')
      .set('x-auth', token)
      .expect(200)
      .then((response) => {
        done();
      })
      .catch((err) => done(err));
  });
});
