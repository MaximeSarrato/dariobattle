import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { reducer as formReducer } from 'redux-form';
import thunk from 'redux-thunk';
import authReducer from '../reducers/auth';
import chatReducer from '../reducers/chat';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
  const store = createStore(
    combineReducers({
      auth: authReducer,
      form: formReducer,
      chat: chatReducer
    }),
    composeEnhancers(applyMiddleware(thunk))
  );
  return store;
};
