import React from 'react';
import { connect } from 'react-redux';
import {
  Card,
  CardActions,
  CardContent,
  TextField,
  InputLabel,
  Input,
  FormControl,
  withStyles,
  InputAdornment,
  IconButton,
  Typography,
  Button
} from 'material-ui';
import classNames from 'classnames';
import { Visibility, VisibilityOff } from 'material-ui-icons';
import { Link } from 'react-router-dom';

import StoneFalls from '../../public/videos/Stone-Falls.webm';

import { startLogin } from '../actions/auth';

const styles = theme => ({
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

class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      error: '',
      showPassword: false
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    const { username, password } = this.state;
    if (username && password) {
      console.log('this.state: ', this.state);
      this.props.startLogin(username, password);
    } else {
      this.setState(() => ({ error: 'Login and password should be filled!' }));
    }
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleMouseDownPassword = event => {
    event.preventDefault();
  };

  handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

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
              onChange={this.handleChange}
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
                onChange={this.handleChange}
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
              href="http://localhost:3000/auth/google"
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
const mapDispatchToProps = dispatch => ({
  startLogin: (email, password) => dispatch(startLogin(email, password))
});

export default withStyles(styles)(
  connect(
    undefined,
    mapDispatchToProps
  )(LoginPage)
);
