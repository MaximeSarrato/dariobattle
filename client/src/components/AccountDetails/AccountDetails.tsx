import React from 'react';
import axios from 'axios';

interface IProps {
  dispatch?: (action: any) => void;
  uid: string;
  username: string;
}

export default class AccountDetails extends React.Component<IProps, {}> {
  componentDidMount() {
    const token = localStorage.getItem('token');
    // FIXME: Remove this call from here, prefer to dispatch an action.
    axios
      .get(`/users/${this.props.uid}`, {
        headers: { 'x-auth': token },
        withCredentials: true
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  render() {
    console.log(this.props)
    return (
      <div>
        <h1>Account</h1>
        <a href="/auth/google">Link my Google Account</a>
        <ul>
          <li>Username: {this.props.username}</li>
        </ul>
      </div>
    );
  }
}
