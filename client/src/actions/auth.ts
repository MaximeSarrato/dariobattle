import axios from 'axios';
import { AuthActionTypes } from '../types';
import { action } from 'typesafe-actions';
import { Dispatch, Action } from 'redux';

export const login = ({ uid, username }: { uid: string; username: string }) =>
  action(AuthActionTypes.LOGIN, { uid, username });

export const startLogin = (username: string, password: string) => {
  return (dispatch: Dispatch<Action<AuthActionTypes.LOGIN>>) => {
    axios
      .post('/users/login', { username, password }, { withCredentials: true })
      .then((response) => {
        localStorage.setItem('token', response.headers['x-auth']);
        return dispatch(
          login({ uid: response.data.uid, username: response.data.username })
        );
      })
      .catch((err) => {
        // FIXME: Handle error without a console.log
        console.log(err.response.data);
        alert(err.response.data);
      });
  };
};

export const startLoginWithTokenOrSID = (token: string) => {
  return (dispatch: Dispatch<Action<AuthActionTypes.LOGIN>>) => {
    axios
      .get('/auth/token', {
        headers: { 'x-auth': token },
        withCredentials: true
      })
      .then((response) => {
        localStorage.setItem('token', response.headers['x-auth']);

        const { uid, username } = response.data;
        return dispatch(login({ uid, username }));
      })
      .catch((err) => {
        // FIXME: Handle error without a console.log
        console.log(err.response.data.error);
      });
  };
};

export const startLogout = (token: string) => {
  return (dispatch: Dispatch<Action<AuthActionTypes.LOGOUT>>) => {
    localStorage.clear();
    axios
      .get('/auth/logout', {
        headers: { 'x-auth': token },
        withCredentials: true
      })
      .then(() => {
        return dispatch(logout());
      })
      .catch((err) => {
        // FIXME: Handle error without a console.log
        console.log(err.response);
      });
  };
};

export const addUsername = (username: string) =>
  action(AuthActionTypes.ADD_USERNAME, { username });

export const logout = () => action(AuthActionTypes.LOGOUT);
