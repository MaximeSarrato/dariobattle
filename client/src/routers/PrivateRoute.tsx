import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import Header from '../components/Header';
import FormDialog from '../components/FormDialog';
import { AuthState } from '../reducers/auth';
// import PermanentDrawer from '../components/PermanentDrawer';

interface IProps {
  isAuthenticated: boolean;
  mustCreateUsername: boolean;
  component: any;
}

/**
 * Load the component according with the URL asked by the client if he is authenticated.
 * Else redirect the client to the login page.
 * @param props
 */
const PrivateRoute = (props: IProps) => {
  const {
    isAuthenticated,
    mustCreateUsername,
    component: Component,
    ...rest
  } = props;
  return (
    <Route
      {...rest}
      component={props =>
        isAuthenticated ? (
          <div>
            <div className="container-fluid">
              <div className="row">
                <Header>
                  <Component {...props} />
                  {mustCreateUsername && <FormDialog />}
                </Header>
              </div>
            </div>
          </div>
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

const mapStateToProps = ({ auth }: { auth: AuthState }) => ({
  isAuthenticated: !!auth.uid,
  mustCreateUsername: !auth.username
});

export default connect(mapStateToProps)(PrivateRoute);
