import express from 'express';
import { body } from 'express-validator';

import User from '../models/user.js';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

router.post(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email.')
			.custom((value, { req }) => {
				console.log('email', value);
				return new Promise((resolve, reject) => {
					User.findOne({ email: value }).then((userDoc) => {
						if (userDoc) {
							reject('This email address is already used.');
						}
						resolve();
					});
				});
			})
			.normalizeEmail(),
		body('password').trim().isLength({ min: 5 }),
		body('name').trim().not().isEmpty(),
	],
	signup
);

router.post('/login', login);

export default router;
