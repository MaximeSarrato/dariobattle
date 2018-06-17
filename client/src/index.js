import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import cookie from 'react-cookie';
import App from './App';
import configureStore from './store/configureStore';
import { startLoginWithTokenOrSID } from './actions/auth';
import './styles/main.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

const store = configureStore();

// Check for token and update application state if required
const token = localStorage.getItem('token');
const sessionID = cookie.load('connect.sid');
if (token) {
	// console.log('Login with token: ', token);
	store.dispatch(startLoginWithTokenOrSID(token));
} else if (sessionID) {
	// console.log('Login with sessionID: ', sessionID);
	// Fetch token from sessionID
	store.dispatch(startLoginWithTokenOrSID(sessionID));
}

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('app')
);
