const mongoose = require("mongoose");
const config = require("config");

module.exports = async function startDB() {
  try {
    await mongoose.connect(config.get("db.uri"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
