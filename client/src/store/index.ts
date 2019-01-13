import { IAuthState } from '../reducers/auth';
import { IChatState } from '../reducers/chat';

export interface IRootReducer {
  auth: IAuthState;
  form: any;
  chat: IChatState;
}
