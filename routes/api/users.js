const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../../models/User');
const keys = require('../../config/keys');

//Load input validation
const validateRegisterInput = require('../../validation/register');

//@route GET api/users/test
//@desc testing
//@access public

router.get('/test', (req, res) =>
	res.json({ msg: 'Users Works' })
);

//@route POST api/users/register
//@desc register new user
//@access public

router.post('/register', (req, res) => {
	const { errors, isValid } =
		validateRegisterInput(req.body);

	//Check Validation
	if (!isValid) {
		res.status(400).json(errors);
	}

	User.findOne({ email: req.body.email })
		.then((user) => {
			if (user) {
				errors.email = 'Email already exists';
				return res.status(400).json(errors);
			} else {
				const avatar = gravatar.url(req.body.email, {
					s: '200', // size
					r: 'x', //rating
					d: 'mm', //default
				});
				const newUser = new User({
					name: req.body.name,
					email: req.body.email,
					password: req.body.password,
					avatar: avatar,
				});
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(
						newUser.password,
						salt,
						(err, hash) => {
							if (err) throw err;
							newUser.password = hash;
							newUser
								.save()
								.then((user) => res.json(user))
								.catch((err) => console.log(err));
						}
					);
				});
			}
		})
		.catch((err) => console.log(err));
});

//@route POST api/users/login
//@desc user login / return JWT token
//@access public
router.post('/login', (req, res) => {
	User.findOne({ email: req.body.email }).then(
		(user) => {
			//check for user
			if (!user) {
				return res
					.status(404)
					.json({ email: 'User does not exist' });
			}
			//check for passowrd
			bcrypt
				.compare(req.body.password, user.password)
				//this will give us a boolean promise
				.then((isMatched) => {
					if (isMatched) {
						//user matched
						// create JWT payload
						const payload = {
							id: user.id,
							name: user.name,
							avatar: user.avatar,
						};
						//sign token
						jwt.sign(
							payload,
							keys.secretOrKey,
							{
								expiresIn: 300,
							},
							(err, token) => {
								res.json({
									success: true,
									token: 'Bearer ' + token,
								});
							}
						);
					} else {
						return res.status(400).json({
							passowrd: 'password incorrect',
						});
					}
				})
				.catch((err) => console.log(err));
		}
	);
});
//@route GET api/users/current
//@desc return current user
//@access private
router.get(
	'/current',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		res.json({
			id: req.user.id,
			name: req.user.name,
			email: req.user.email,
		});
	}
);
module.exports = router;
