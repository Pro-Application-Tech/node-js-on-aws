// ./database/models/User.js

const { Schema, model, } = require('mongoose');

const User = new Schema({
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  confirmed: { type: Boolean, default: false },
}, {
  timestamps: true, // this will make it so the objects have the createdAt and updatedAt fields
});

module.exports = model('User', User);