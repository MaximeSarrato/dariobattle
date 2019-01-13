import * as React from 'react';
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
  startLogin(username: string, password: string): void;
}

interface IState {
  readonly username: string;
  readonly password: string;
  readonly error: string;
  readonly showPassword: boolean;
}

class Login extends React.Component<IProps, IState> {
  readonly state: IState = {
    username: '',
    password: '',
    error: '',
    showPassword: false
  };

  constructor(props: IProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this);
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { username, password } = this.state;
    if (username && password) {
      this.props.startLogin(username, password);
    } else {
      this.setState({ error: 'Login and/or password are empty.' });
    }
  }

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
              Submit
            </Button>
          </form>
          <hr />
          <div className="box-layout__social">
            <a
              href="/auth/google"
              className="social-button"
              id="google-connect"
            >
              <span>Connect with Google</span>
            </a>
            {/* <a href="#" class="social-button" id="google-connect">
              <span>Connect with Twitter</span>
            </a>
            <a href="#" class="social-button" id="google-connect">
              <span>Connect with LinkedIn</span>
            </a> */}
          </div>
          <hr />
          <div className="box-layout__footer">
            <p>
              Haven't an account yet ? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Login);
