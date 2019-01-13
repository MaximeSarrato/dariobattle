import axios, { AxiosResponse } from 'axios';
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FormUsername } from '../';
import { submit } from 'redux-form';
import { addUsername } from '../../../actions/auth';

interface IProps {
  hasUsername: boolean;
  dispatch?: any;
  createUsernameForm: any;
}

interface IState {
  readonly open: boolean;
}

export default class FormDialog extends React.Component<IProps, IState> {
  readonly state: IState = {
    open: !this.props.hasUsername
  };

  constructor(props: IProps) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleClickSubmit = this.handleClickSubmit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleClose() {
    this.setState({ open: false });
  }

  handleClickSubmit() {
    this.props.dispatch(submit('createUsernameForm'));
  }

  handleSubmit() {
    const { username, password } = this.props.createUsernameForm.values;
    axios
      .post(
        '/users/signup',
        { username, password },
        {
          withCredentials: true
        }
      )
      .then((response: AxiosResponse) => {
        // Add username to global state
        // in order to close the form dialog
        this.props.dispatch(addUsername(response.data.username));
      })
      .catch((error) => {
        alert(error);
      });
  }

  render() {
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}
