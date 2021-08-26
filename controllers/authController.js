import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { JWT_SECRET_KEY } from '../middleware/is-auth.js';
import User from '../models/user.js';

export const signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const err = new Error('Validation Failed.');
		err.statusCode = 422;
		err.data = errors.array();
		console.log(err.data);
		throw err;
	}

	const { email, name, password } = req.body;
	bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			const user = new User({
				email: email,
				password: hashedPassword,
				name: name,
			});

			return user.save();
		})
		.then((result) => {
			res.status(201).json({
				message: 'New user created.',
				user: {
					email: result.email,
					id: result._id.toString(),
				},
			});
		})
		.catch((err) => {
      err.statusCode = err.statusCode || 500;
			next(err);
		});
};

export const login = (req, res, next) => {
	const { email, password } = req.body;

	let theUser;

	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				const error = new Error('this email could not be found.');
				error.statusCode = 401;
				throw error;
			}

			theUser = user;
			return bcrypt.compare(password, user.password);
		})
		.then((isMatch) => {
			if (!isMatch) {
				const error = new Error('Wrong email or password!');
				error.statusCode = 401;
				throw error;
			}
      const userId = theUser._id.toString();
			const token = jwt.sign(
				{
					email: theUser.email,
					name: theUser.name,
					userId: userId,
				},
				JWT_SECRET_KEY,
				{
					expiresIn: '1h',
				}
			);

      res.status(200).json({
        token: token,
        user: {
          id: userId,
          name: theUser.name,
        }
      });
		})
    .catch( err => {
      err.statusCode = err.statusCode || 500;
      next(err);
    });
};
