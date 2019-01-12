import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { AuthState } from '../reducers/auth';

interface IProps {
  isAuthenticated: boolean;
  component: any;
}

/**
 * Load the component according with the URL asked by the client if he is not authenticated.
 * Else redirect the client to dashboard.
 */
const PublicRoute = ({
  isAuthenticated,
  component: Component,
  ...rest
}: {
  isAuthenticated: boolean;
  component: any;
}) => (
  <Route
    {...rest}
    component={props =>
      isAuthenticated ? <Redirect to="/dashboard" /> : <Component {...props} />
    }
  />
);

const mapStateToProps = ({ auth }: { auth: AuthState }) => ({
  isAuthenticated: !!auth.uid
});

export default connect(mapStateToProps)(PublicRoute);
