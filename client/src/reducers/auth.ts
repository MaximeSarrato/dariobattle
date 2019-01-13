import * as authActions from '../actions/auth';
import { ActionType } from 'typesafe-actions';
import { AuthActionTypes } from '../types';

export interface IAuthState {
  readonly uid: string;
  readonly username: string;
}

const initialState: IAuthState = {
  uid: '',
  username: ''
}

type AuthAction = ActionType<typeof authActions>

export default (state = initialState, action: AuthAction) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN: {
      return {
        uid: action.payload.uid,
        username: action.payload.username
      };
    }
    case AuthActionTypes.LOGOUT: {
      return initialState;
    }
    case AuthActionTypes.ADD_USERNAME: {
      return {
        ...state,
        username: action.payload.username
      };
    }
    default: {
      return state;
    }
  }
};
