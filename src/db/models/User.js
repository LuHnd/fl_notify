const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  id: { type: String, unique: true },
  first_name: { type: String },
  last_name: { type: String },
  username: { type: String },
  categories: [{ type: Types.ObjectId, ref: "Subcategory" }],
});

module.exports = model("User", schema);
