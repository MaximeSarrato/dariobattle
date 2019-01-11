import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// @TODO Need to check if duration is expired
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token = req.header('X-Auth');
  // If user got jwt in his session it means he has been authenticated by
  // Google or other provider and he needs to receive a token and
  // his profile data

  if (req.session.jwt) {
    token = req.session.jwt;
  }

  if (!token) {
    const error = 'You are not authenticated. Redirect to login...';
    return res.status(403).send({ error });
  }

  User.findOne({ token }).then((user) => {
    if (!user) {
      return res.status(404).send({ error: 'This token does not exist.' });
    }
    res.locals.user = user;
    next();
  });
};
