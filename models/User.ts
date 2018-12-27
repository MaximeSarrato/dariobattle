import * as mongoose from 'mongoose';
import { IUserDocument } from '../interfaces/IUserDocument';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [
      function() {
        return !this.googleID;
      },
      'username is required if googleID is not specified'
    ]
  },
  password: {
    type: String,
    required: [
      function() {
        return !!this.username;
      },
      'password is required if username is specified'
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  token: {
    type: String,
    default: ''
  },
  googleID: {
    type: String,
    required: [
      function() {
        return !this.username;
      },
      'googleID is required if username is not specified'
    ]
  }
});

const User = mongoose.model<IUserDocument>('users', userSchema);
export default User;
