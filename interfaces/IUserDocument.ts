import { Document } from 'mongoose';

export interface IUserDocument extends Document {
  username: string;
  password: string;
  createdAt: number;
  token: string;
  googleID: string;
}
