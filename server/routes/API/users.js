const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'please enter a valid email address').isEmail(),
		check('password', 'Password should be at least 6 characters').isLength({
			min: 6,
		}),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// check if user exists
			let user = await User.findOne({ email });

			if (user) {
				res.status(400).json({
					errors: [
						{
							msg: 'User already exists',
						},
					],
				});
			}

			//    Get users gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm',
			});

			user = new User({
				name,
				email,
				avatar,
				password,
			});

			//    Encrypt Password

			const salt = await bcrypt.genSalt(10);

			user.password = await bcrypt.hash(password, salt);
			await user.save();

			//    return jwt

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get('jwtToken'),
				{
					expiresIn: 360000,
				},
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				},
			);

			console.log(req.body);
		} catch (error) {
			console.error(error.message);
			res.send(500).send('Server error');
		}
	},
);

module.exports = router;
