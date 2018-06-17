import axios from 'axios';

const ROOT_URL = 'http://localhost:3000';
// const ROOT_URL = 'http://managerback.maildigit.fr';

export const login = ({ uid, username }) => ({
  type: 'LOGIN',
  uid,
  username
});

export const startLogin = (username, password) => {
  return dispatch => {
    axios
      .post(
        `${ROOT_URL}/users/login`,
        { username, password },
        { withCredentials: true }
      )
      .then(response => {
        localStorage.setItem('token', response.headers['x-auth']);
        const { uid, username } = response.data;
        return dispatch(login({ uid, username }));
      })
      .catch(err => {
        // console.log(err.response);
        alert(err.response.data);
      });
  };
};

export const startLoginWithTokenOrSID = token => {
  return dispatch => {
    axios
      .get(`${ROOT_URL}/auth/token`, {
        headers: { 'x-auth': token },
        withCredentials: true
      })
      .then(response => {
        localStorage.setItem('token', response.headers['x-auth']);

        const { uid, username } = response.data;
        return dispatch(login({ uid, username }));
      })
      .catch(err => {
        console.log(err.response.data.error);
      });
  };
};

export const startLogout = token => {
  return dispatch => {
    localStorage.clear();
    console.log('cookies: ', window.document.cookie);
    axios
      .get(`${ROOT_URL}/auth/logout`, {
        headers: { 'x-auth': token },
        withCredentials: true
      })
      .then(response => {
        console.log('cookies: ', window.document.cookie);
        return dispatch(logout());
      })
      .catch(err => {
        console.log(err.response);
      });
  };
};

export const addUsername = username => ({
  type: 'ADD_USERNAME',
  username
});

export const logout = () => ({ type: 'LOGOUT' });
