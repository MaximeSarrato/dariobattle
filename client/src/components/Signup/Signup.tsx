import React from 'react';
import axios from 'axios';
import {
  TextField,
  InputLabel,
  Input,
  FormControl,
  withStyles,
  InputAdornment,
  IconButton,
  Button
} from '@material-ui/core';
import classNames from 'classnames';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { Link } from 'react-router-dom';

import { Alert } from '../common';
import * as StoneFalls from '../../../public/videos/Stone-Falls.webm';

const styles = (theme: any) => ({
  card: {
    minWidth: 275,
    maxWidth: 500
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300,
    padding: '1em'
    // backgroundColor: 'white'
  },
  menu: {
    width: 200
  },
  button: {
    margin: '12px'
  }
});

interface IProps {
  classes: {
    textField: any;
    margin: any;
    button: any;
  };
  history: any;
  startLogin(username: string, password: string): void;
}

interface IState {
  readonly username: string;
  readonly password: string;
  readonly error: string;
  readonly showPassword: boolean;
  readonly showAlert: boolean;
  readonly alertMessage: string;
}

class Signup extends React.Component<IProps, IState> {
  readonly state: IState = {
    username: '',
    password: '',
    error: '',
    showPassword: false,
    showAlert: false,
    alertMessage: ''
  };

  constructor(props: IProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this);
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { username, password } = this.state;
    if (username && password) {
      // FIXME: Do this in a dispatched action
      axios
        .post('/users/signup', { username, password })
        .then((response) => {
          if (response.status === 200) {
            // Redirect
            this.setState({
              showAlert: true,
              alertMessage:
                'Your account has been created! You will be redirected to login in a few seconds...'
            });
            setTimeout(() => {
              this.props.history.push('/');
              this.setState({
                showAlert: false,
                alertMessage: ''
              });
            }, 6000);
          }
        })
        .catch((error) => {
          this.setState({
            showAlert: true,
            alertMessage: error.response.data
          });
          setTimeout(() => {
            this.setState({
              showAlert: false,
              alertMessage: ''
            });
          }, 6000);
        });
    } else {
      this.setState(() => ({ error: 'Login and password should be filled!' }));
    }
  };

  handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      username: event.target.value
    });
  }

  handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      password: event.target.value
    });
  }

  handleMouseDownPassword(event: any) {
    event.preventDefault();
  }

  handleClickShowPassword() {
    this.setState({ showPassword: !this.state.showPassword });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        {this.state.showAlert && (
          <Alert
            horizontal="center"
            vertical="top"
            message={this.state.alertMessage}
          />
        )}
        <div className="box-layout">
          <video autoPlay muted loop poster="Stone-Falls">
            <source src={StoneFalls} />
          </video>
          <div className="box-layout__box">
            <div className="box-layout__title">
              <h1>Dario Battle</h1>
            </div>
            {this.state.error && (
              <p className="alert alert-danger">{this.state.error}</p>
            )}
            <form onSubmit={this.handleSubmit}>
              <TextField
                required
                name="username"
                label="Username"
                className={classes.textField}
                margin="normal"
                onChange={this.handleUsernameChange}
              />
              <FormControl
                className={classNames(classes.margin, classes.textField)}
              >
                <InputLabel htmlFor="adornment-password">Password</InputLabel>
                <Input
                  id="adornment-password"
                  type={this.state.showPassword ? 'text' : 'password'}
                  value={this.state.password}
                  name="password"
                  onChange={this.handlePasswordChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={this.handleClickShowPassword}
                        onMouseDown={this.handleMouseDownPassword}
                      >
                        {this.state.showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <Button
                className={classes.button}
                color="primary"
                variant="raised"
                type="submit"
              >
                Create my account
              </Button>
            </form>
            <hr />
            <div className="box-layout__footer">
              <p>
                Have already an account ? <Link to="/">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Signup);
