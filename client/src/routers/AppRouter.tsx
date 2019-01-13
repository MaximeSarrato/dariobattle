import * as React from 'react';
import { Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import DashboardContainer from '../containers/DashboardContainer';
import Leaderboard from '../components/Leaderboard';
import LoginContainer from '../containers/LoginContainer';
import SignupContainer from '../containers/SignupContainer';
import AccountDetailsContainer from '../containers/AccountDetailsContainer';
import Play from '../components/Play';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';

const AppRouter = () => (
  <Router history={createBrowserHistory()}>
    <Switch>
      <PrivateRoute exact path="/dashboard" component={DashboardContainer} />
      <PrivateRoute exact path="/leaderboard" component={Leaderboard} />
      <PrivateRoute exact path="/profile" component={AccountDetailsContainer} />
      <PrivateRoute exact path="/play" component={Play} />
      <PublicRoute exact path="/signup" component={SignupContainer} />
      <PublicRoute path="/" component={LoginContainer} />
    </Switch>
  </Router>
);

export default AppRouter;
