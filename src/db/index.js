const mongoose = require("mongoose");
const config = require("config");
const Category = require("./models/Category.js");
const Subcategory = require("./models/Subcategory.js");
const Source = require("../db/models/Source.js");
const Selector = require("../db/models/Selector.js");
const User = require("../db/models/User.js");
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
  user: {
    getUser: async (id) => {
      return await User.findOne({ id });
    },
    updateCategory: async (id, category) => {
      return await User.findOne({ id }).then(async ({ categories }) => {
        if (categories.includes(category)) {
          categories.splice(categories.indexOf(category), 1);
        } else {
          categories.push(category);
        }

        await User.update({ id }, { categories });

        return await User.findOne({ id });
      });
    },
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
  getCategory: async (title) => {
    return await Subcategory.find({ category: title });
  },
  setCategories: async (sourceName, categories) => {
    try {
      for (let category in categories) {
        for (subcategory in categories[category].subcategories) {
          await Subcategory.update(
            { path: categories[category].subcategories[subcategory].path },
            {
              ...categories[category].subcategories[subcategory],
              category: categories[category].title,
            },
            { upsert: true }
          );
        }

        let subcategories = await Subcategory.find({
          category: categories[category].title,
        }).exec();
        await Category.update(
          { title: categories[category].title },
          { subcategories: subcategories.map(({ _id }) => _id) },
          { upsert: true }
        );
      }

      let dbCategories = await Category.find({});

      await Source.findOneAndUpdate(
        {
          title: sourceName,
        },
        { categories: dbCategories }
      );

      console.log("Categories update done");
    } catch (err) {
      console.log(err);
    }
  },
};
