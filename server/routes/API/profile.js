const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator/check');

// Get current user's profile
// Private access , auth middleware needed
router.get('/me', auth, async (req, res, next) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res.status(400).json({
				msg: 'Profile not found',
			});
		}
		res.json(profile);
	} catch (error) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// Post req api/profile
// create/ update a user profile
// Private access , auth middleware needed

router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is required').not().isEmpty(),
			check('skills', 'Skills is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body;

		//build profile object

		const profileFields = {};
		profileFields.user = req.user.id;

		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills) {
			profileFields.skills = skills.split(',').map((skill) => skill.trim());
		}

		//build profile object

		profileFields.social = {};

		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (bio) profileFields.social.bio = bio;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			let profile = Profile.findOne({ user: req.user.id });

			// Updating profile fields
			if (profile) {
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true },
				);

				return res.json(profile);
			}

			// if profile is not found then create a new profile
			profile = new Profile(profileFields);
			await profile.save();
			res.json(profile);
		} catch (error) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	},
);

// #route GET api/profile
// #desc Get all profiles
// #access Public

router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (error) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// #route GET api/profile/user/:user_id
// #desc Get profile by user ID
// #access Public

router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res
				.status(400)
				.json({ message: 'No profile found for this user' });
		}
		res.json(profile);
	} catch (error) {
		console.error(err.message);

		if (error.kind == 'ObjectId') {
			return res
				.status(400)
				.json({ message: 'No profile found for this user' });
		}
		res.status(500).send('Server error');
	}
});

// #route DELETE api/profile
// #desc delete user and profile
// #access Private

router.delete('/', auth, async (req, res) => {
	try {
		//remove users' post
		//Remove profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Remove user
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User deleted successfully' });
	} catch (error) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// #route PUT api/profile/experience
// #desc Add profile experience
// #access Private

router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'company is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, company, location, from, to, current, description } =
			req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.experience.unshift(newExp);
			await profile.save();
			res.json(profile);
		} catch (error) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	},
);

// #route DELETE api/profile/experience/:exp_id
// #desc delete experience
// #access Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		//Remove experience
		const profile = await Profile.findOne({ user: req.user.id });

		const removeIndex = profile.experience
			.map((e) => e.id)
			.indexOf(req.params.exp_id);

		profile.experience.splice(removeIndex, 1);
		await profile.save();

		res.json(profile);
	} catch (error) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// #route PUT api/profile/education
// #desc Add profile education
// #access Private

router.put(
	'/education',
	[
		auth,
		[
			check('school', 'school is required').not().isEmpty(),
			check('degree', 'degree is required').not().isEmpty(),
			check('fieldofstudy', ' fieldofstudy is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { school, degree, fieldofstudy, from, to, current, description } =
			req.body;

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.educatiom.unshift(newEdu);
			await profile.save();
			res.json(profile);

		} catch (error) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	},
);

// #route DELETE api/profile/education/:edu_id
// #desc delete education
// #access Private

router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		//Remove education
		const profile = await Profile.findOne({ user: req.user.id });

		const removeIndex = profile.education
			.map((e) => e.id)
			.indexOf(req.params.edu_id);

		profile.education.splice(removeIndex, 1);
		await profile.save();

		res.json(profile);
	} catch (error) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
