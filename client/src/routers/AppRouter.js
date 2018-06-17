import React from 'react';
import { Router, Switch, Link } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import Dashboard from '../components/Dashboard';
import Leaderboard from '../components/Leaderboard';
import LoginPage from '../components/LoginPage';
import SignupPage from '../components/SignupPage';
import Profile from '../components/Profile';
import Play from '../components/Play';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';

const AppRouter = () => (
  <Router history={createHistory()}>
    <Switch>
      <PrivateRoute exact path="/dashboard" component={Dashboard} />
      <PrivateRoute exact path="/leaderboard" component={Leaderboard} />
      <PrivateRoute exact path="/profile" component={Profile} />
      <PrivateRoute exact path="/play" component={Play} />
      <PublicRoute exact path="/signup" component={SignupPage} />
      <PublicRoute path="/" component={LoginPage} />
    </Switch>
  </Router>
);

export default AppRouter;
