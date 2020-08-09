const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  title: { type: String, unique: true },
  subcategories: [{ type: Types.ObjectId, ref: "Subcategory" }],
});

module.exports = model("Category", schema);
