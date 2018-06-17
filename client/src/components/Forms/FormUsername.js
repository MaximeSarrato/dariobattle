import React from 'react';
import { TextField } from 'redux-form-material-ui';
import { reduxForm, Field } from 'redux-form';
import axios from 'axios';

const validate = values => {
  const errors = {};
  if (!values.username) {
    errors.username = 'Required';
  }
  if (!values.password) {
    errors.password = 'Required';
  }
  return errors;
};

const asyncValidate = (values /*, dispatch */) => {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('token');
    axios
      .post(
        'http://localhost:3000/users/username',
        { username: values.username },
        {
          headers: { 'x-auth': token },
          withCredentials: true
        }
      )
      .then(response => {
        resolve();
      })
      .catch(err => {
        reject({ username: err.response.data });
      });
  });
};

const FormUsername = props => {
  const { handleSubmit, pristine, reset, submitting } = props;
  return (
    <form onSubmit={handleSubmit}>
      <Field
        component={TextField}
        autoFocus
        fullWidth
        label="Username"
        margin="dense"
        name="username"
      />
      <Field
        component={TextField}
        fullWidth
        label="Password"
        margin="dense"
        name="password"
        type="password"
      />
    </form>
  );
};

export default reduxForm({
  form: 'createUsernameForm',
  validate,
  asyncValidate,
  asyncBlurFields: ['username']
})(FormUsername);
