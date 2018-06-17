import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import Header from '../components/Header';
import FormDialog from '../components/FormDialog';
// import PermanentDrawer from '../components/PermanentDrawer';

const PrivateRoute = ({
  isAuthenticated,
  mustCreateUsername,
  component: Component,
  ...rest
}) => {
  // console.log('...rest: ', rest);
  // console.log('isAuthenticated: ', isAuthenticated);
  // console.log('mustCreateUsername: ', mustCreateUsername);
  // console.log('component: ', Component);
  //
  return (
    // If user is logged in then load component
    // Else redirect to / which is the LoginPage
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

const mapStateToProps = state => ({
  isAuthenticated: !!state.auth.uid,
  mustCreateUsername: !state.auth.username
});

export default connect(mapStateToProps)(PrivateRoute);
