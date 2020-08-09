const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  id: { type: String, unique: true },
  first_name: { type: String },
  last_name: { type: String },
  username: { type: String },
  categories: [],
});

module.exports = model("User", schema);
