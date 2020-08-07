const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  title: { type: String },
  description: { type: String },
  price: { type: String },
  category: { type: Types.ObjectId, ref: "Subcategory" },
  url: { type: String, unique: true },
});

module.exports = model("Offer", schema);
