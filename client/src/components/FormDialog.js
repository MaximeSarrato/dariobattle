import axios from 'axios';
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormUsername from './Forms/FormUsername';
import { submit } from 'redux-form';
import { addUsername } from '../actions/auth';
import { connect } from 'react-redux';

class FormDialog extends React.Component {
  state = {
    open: !this.props.hasUsername
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = () => {
    const { username, password } = this.props.createUsernameForm.values;
    axios
      .post(
        'http://localhost:3000/users/signup',
        { username, password },
        {
          withCredentials: true
        }
      )
      .then(response => {
        const { username } = response.data;
        // Add username to global state
        // in order to close the form dialog
        this.props.dispatch(addUsername(username));
      })

      .catch(error => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
      });
  };

  handleClickSubmit = () => {
    console.log('handleClickSubmit()');
    this.props.dispatch(submit('createUsernameForm'));
  };

  render() {
    return (
      <div>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
          <DialogContent>
            <DialogContentText>
              In order to play to Dario, please enter an username and a password
              here. We will need these credentials for game things ;)
            </DialogContentText>
            <FormUsername onSubmit={this.handleSubmit} />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleClickSubmit} color="primary">
              Subscribe
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  createUsernameForm: state.form.createUsernameForm,
  hasUsername: !!state.auth.username
});

export default connect(
  mapStateToProps,
  undefined
)(FormDialog);
