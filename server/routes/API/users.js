const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

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
			//    check if user exists
            let user = await User.findOne({ email });

            if (user) {
                res.status(400).json({
                    errors: [{
                        msg: 'User already exists'
                    }]
                });
            }
			//    Get users gravatar
			//    Encrypt Password
			//    return jwt
            	res.send(req.body);
        } catch (error) {
            console.error(error.message);
            res.send(500).send('Server error');
        }

	
	},
);

module.exports = router;
