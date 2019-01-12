import { ChatActionTypes } from "../types";
import * as chatActions from '../actions/chat';
import { ActionType } from "typesafe-actions";

export type ChatState = {
  readonly users: string[]
}

const initialState: ChatState = {
  users: []
}

type ChatAction = ActionType<typeof chatActions>

export default (state = initialState, action: ChatAction) => {
  switch (action.type) {
    case ChatActionTypes.POPULATE_USERS: {
      return {
        users: action.payload.users
      };
    }
    default: {
      return state;
    }
  }
};
