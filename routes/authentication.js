// ./routes/authentication.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../database/models');

// We will use a Regular Expression to validate the email address
// For advanced input validation, please use a library such as Joi: https://joi.dev/
const validateEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// Controller for POST /authentication/register
router.post('/register', async function(req, res) {
  try {
    // Get the email and password from the request body
    const { email, password } = req.body;

    // Validate email
    if (!email || !validateEmailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address',
      });
    }

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: 'Please enter a password of at least 8 characters',
      });
    }

    // Check if the user already exists
    const user = await User.findOne({ email: email }).select({ _id: 1, });

    // If the user already exists, return an error
    if (user) {
      return res.status(400).json({
        message: 'A user with this email already exists',
      });
    }

    // Any error thrown by these lines will be caught by the catch block
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If the user does not exist, create a new user
    const newUser = new User({
      email: email,
      password: hashedPassword,
    });

    await newUser.save();

    // This is where we should generate a JWT token that allows the user to validate their account
    const validationToken = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: '1d', // The activation token will expire in 1 day, therefore the activation link will also expire
    });

    // Create a link that sends the user to the Frontend application that is consuming this API
    const validationLink = `${ process.env.FRONTEND_URL }/authentication/validate/${ validationToken }`;

    // Send the user an email
    /*
    As mentioned, this is not covered in this tutorial, but we'd like to give you an idea of what you can do.
    Our suggestion is to use Sendgrid, it will be enough for a learning experience: https://www.npmjs.com/package/@sendgrid/mail
    If you wish to go to production, there's also paid plans which are reasonably priced.
    You may set up Sendgrid as instructed in their documentation, in the npmjs.com link above,
    and then you can send the "validationLink" to the user's email address.
     */

    // (Optional) Create a JWT token for the user
    const token = jwt.sign({ id: newUser._id, }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    return res.status(200).json({
      message: 'User created successfully',
      token,
    });
  } catch(error) {
    // In Production mode, you should log all errors to a logging service such as Sentry
    // For the purpose of this tutorial, we will log to the console
    console.log(error);
    return res.status(400).json({
      message: 'An internal error occurred',
    });
  }
});

// Controller for POST /authentication/login
router.post('/login', async function(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !validateEmailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address',
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: 'Please enter a password of at least 8 characters',
      });
    }

    // Fetch the user from the database
    const user = await User.findOne({ email: email }).select({ _id: 1, password: 1, });

    // If the user does not exist, return an error
    if (!user) {
      return res.status(400).json({
        message: 'Incorrect email or password', // The reason why the error message is vague is because
      });
    }

    // Check if the entered password matches the password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Incorrect email or password',
      });
    }

    const token = jwt.sign({ id: user._id, }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    return res.status(200).json({
      message: 'Signed in successfully',
      token,
    });
  } catch(error) {
    console.log(error);
    return res.status(400).json({
      message: 'An internal error occurred',
    });
  }
});

module.exports = router;