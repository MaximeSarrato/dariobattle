import { login, logout } from '../../actions/auth';

const uid = 'abc123';

test('should setup a login action object', () => {
  const action = {
    type: 'LOGIN',
    uid
  };
  expect(login(uid)).toEqual(action);
});

test('should setup a logout action object', () => {
  expect(logout()).toEqual({ type: 'LOGOUT' });
});
