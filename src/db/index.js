const mongoose = require("mongoose");
const config = require("config");
const Category = require("./models/Category.js");
const Subcategory = require("./models/Subcategory.js");
const Source = require("../db/models/Source.js");
const Selector = require("../db/models/Selector.js");

module.exports = {
  startDB: async () => {
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
  },
  getSource: async function (sourceName) {
    try {
      return await Source.findOne({
        title: sourceName,
      })
        .populate({
          path: "selector",
          model: Selector,
          select: "title container description price",
        })
        .populate({
          path: "categories",
          model: Category,
          select: "title -_id",
          populate: {
            path: "subcategories",
            model: Subcategory,
            select: "title path _id",
          },
        });
    } catch (err) {
      console.log(err);
    }
  },
};
