import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Header } from '../components/common';
import FormDialog from '../containers/FormDialogContainer';
import { IAuthState } from '../reducers/auth';

interface IProps {
  isAuthenticated: boolean;
  mustCreateUsername: boolean;
  component: any;
  exact?: boolean;
  dispatch?: (action: any) => void;
  path: string;
}

/**
 * Load the component according with the URL asked by the client if he is authenticated.
 * Else redirect the client to the login page.
 * @param props
 */
const PrivateRoute: React.SFC<IProps> = (props) => {
  const {
    isAuthenticated,
    mustCreateUsername,
    component: Component,
    ...rest
  } = props;

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <Route
      {...rest}
      component={(props) => (
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
      )}
    />
  );
};

const mapStateToProps = ({ auth }: { auth: IAuthState }) => ({
  isAuthenticated: !!auth.uid,
  mustCreateUsername: !auth.username
});

export default connect(mapStateToProps)(PrivateRoute);
