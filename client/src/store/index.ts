import { AuthState } from "../reducers/auth";
import { ChatState } from "../reducers/chat";

export interface RootReducer {
  auth: AuthState;
  form: any;
  chat: ChatState;
}
