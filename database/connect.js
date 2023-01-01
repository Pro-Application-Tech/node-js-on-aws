// ./database/connect.js

const mongoose = require('mongoose');

// This will remove a deprecation warning regarding the upcoming Mongoose v7
mongoose.set('strictQuery', true);

async function connect() {
  try {
     // MONGO_URI is set in .env and is loaded in app.js by the dotenv package
    await mongoose.connect(process.env.MONGO_URI);
    // Load all models
    require('./models/index.js')
    // Success
    console.log(`Successfully connected to database ${ process.env.MONGO_URI }`);
  } catch(error) {
    // Log error
    console.log(`The following error has occurred: ${ error }`);
    // Stop the server
    process.exit(1);
  }
}

module.exports = {
  connect,
}