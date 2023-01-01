// ./middleware/decodeJWTMiddleware.js

const jwt = require('jsonwebtoken');
const { User } = require('../database/models');

/**
 * Will decode a JWT token from the "Authorization" header
 * If successful, will attach the token's payload on "req.decoded"
 */
const decodeJWTMiddleware = (req, res, next) => {
  // Get the token from the "Authorization" header
  const token = req.headers?.authorization?.replace('Bearer ', '');

  // If the token is not present, return an error
  if (!token) {
    return res.status(401).json({
      status: 'error',
      error: 'You need to log in before viewing this'
    });
  } else {
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
      if (err) {
        switch(err.name) {
          case 'TokenExpiredError': {
            return res.status(401).json({
              status: 'error',
              error: 'The session has expired. Please re-login.'
            });
          }
          case 'JsonWebTokenError': {
            return res.status(401).json({
              status: 'error',
              error: 'The session is invalid. Please re-login.',
            });
          }
          default: {
            return res.status(401).json({
              status: 'error',
              error: 'There has been an error. Please re-login.'
            });
          }
        }
      }

      // Fetch the user from the database
      // We only select the "_id" field because we want the query to be very fast, and to consume the least amount of
      // bandwidth we can
      const user = await User.findById(decoded.id).select({ _id: 1, });

      // If the user does not exist, return an error
      if (!user) {
        return res.status(401).json({
          status: 'error',
          error: 'The session is invalid. Please re-login.',
        });
      }

      // Attach the decoded token on "req.decoded"
      req.decoded = decoded;

      return next();
    });
  }
};

module.exports = decodeJWTMiddleware;