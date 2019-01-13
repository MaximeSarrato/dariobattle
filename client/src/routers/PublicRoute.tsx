import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { IAuthState } from '../reducers/auth';

interface IProps {
  isAuthenticated: boolean;
  component: any;
  exact?: boolean;
  path: string;
}

/**
 * Load the component according with the URL asked by the client if he is not authenticated.
 * Else redirect the client to dashboard.
 */
const PublicRoute: React.SFC<IProps> = ({
  isAuthenticated,
  component: Component,
  ...rest
}: {
  isAuthenticated: boolean;
  component: any;
}) => {
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }
  return <Route {...rest} component={(props) => <Component {...props} />} />;
};

const mapStateToProps = ({ auth }: { auth: IAuthState }) => ({
  isAuthenticated: !!auth.uid
});

export default connect(mapStateToProps)(PublicRoute);
