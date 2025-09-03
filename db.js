const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI; // load connection string from Render env var

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose;
