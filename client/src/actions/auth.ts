import axios from 'axios';
import { AuthActionTypes } from '../types';
import { action } from 'typesafe-actions';

export const login = ({ uid, username }: { uid: string; username: string }) =>
  action(AuthActionTypes.LOGIN, { uid, username });

export const startLogin = (username: string, password: string) => {
  return dispatch => {
    axios
      .post('/users/login', { username, password }, { withCredentials: true })
      .then(response => {
        localStorage.setItem('token', response.headers['x-auth']);
        const { uid, username } = response.data;
        return dispatch(login({ uid, username }));
      })
      .catch(err => {
        console.log(err.response.data);
        alert(err.response.data);
      });
  };
};

export const startLoginWithTokenOrSID = (token: string) => {
  return dispatch => {
    axios
      .get('/auth/token', {
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

export const startLogout = (token: string) => {
  return dispatch => {
    localStorage.clear();
    axios
      .get('/auth/logout', {
        headers: { 'x-auth': token },
        withCredentials: true
      })
      .then(response => {
        return dispatch(logout());
      })
      .catch(err => {
        console.log(err.response);
      });
  };
};

export const addUsername = (username: string) =>
  action(AuthActionTypes.ADD_USERNAME, { username });

export const logout = () => action(AuthActionTypes.LOGOUT);
