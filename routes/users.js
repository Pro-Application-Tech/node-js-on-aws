// ./routes/users.js

const express = require('express');
const router = express.Router();
const { User } = require('../database/models');

// Controller for GET /users/me
router.get('/me', async function(req, res) {
  try {
    const user = await User.findById(req.decoded.id).select({ _id: 1, email: 1, });

    if (!user) {
      return res.status(400).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch(error) {
    console.log(error);
    return res.status(400).json({
      message: 'An internal error occurred',
    });
  }
});

module.exports = router;
