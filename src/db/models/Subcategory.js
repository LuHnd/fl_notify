const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  title: { type: String },
  category: { type: String },
  path: { type: String, unique: true },
});

module.exports = model("Subcategory", schema);
