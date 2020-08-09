process.env.NODE_CONFIG_DIR = "../config";

const _ = require("lodash/array.js");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const iconv = require("iconv-lite");
const mongoose = require("mongoose");

const config = require("config");
const Category = require("../db/models/Category.js");
const Selector = require("../db/models/Selector.js");
const Source = require("../db/models/Source.js");
const Offer = require("../db/models/Offer.js");
const Subcategory = require("../db/models/Subcategory.js");

class ParseWorker {
  constructor(sourceName) {
    this.sourceName = sourceName;
    this.sourceData = {};
  }

  loadPage = async (base, url) => {
    return fetch(base + url).then((res) => {
      return res.buffer().then((buffer) => iconv.decode(buffer, "win1251"));
    });
  };

  getCategories = async (base, url) => {
    const $ = cheerio.load(await this.loadPage(base, url));
    const data = $(".category_tree .collapse")
      .map((i, el) => {
        let category = $(el).parent().children("a").text();
        return {
          subcategories: $(el)
            .find("li")
            .map((i, el) => {
              return {
                title: $(el).find("a").text(),
                path: $(el).find("a").attr("href"),
              };
            })
            .get(),
          title: category,
        };
      })
      .get();
    return data;
  };

  parse = async (base, url, selectors) => {
    const $ = cheerio.load(await this.loadPage(base, url));

    const data = $(selectors.container)
      .map((i, el) => {
        return {
          title: $(el).find(selectors.title).text(),
          description: $(el).find(selectors.description).text().split("\n")[0],
          price: $(el).find(selectors.price).text(),
          url: base + $(el).find(selectors.title).attr("href"),
        };
      })
      .get();

    return data;
  };

  getsourceData = () => {
    return this.sourceData;
  };

  fetchSourceData = async (sourceName) => {
    this.sourceData = await Source.findOne({
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
          select: "title path lastOffers _id",
        },
      });
  };

  saveAndGetNew = async (category_id, parsedData) => {
    let newOffers = [];

    for (let item = 0; item < parsedData.length; item++) {
      let { title, description, price, category, url } = parsedData[item];
      let offer = await new Offer({
        title,
        description,
        price,
        category: category_id,
        url,
      })
        .save()
        .catch((err) => err.code)
        .then((err) => {
          if (err != 11000) {
            newOffers.push(parsedData[item]);
          }
          return;
        });
    }
    return newOffers;
  };

  parseAndSave = async ({ title, path, _id }, selector) => {
    try {
      const parsedData = await this.parse(this.sourceData.base, path, selector);
      let sub = await Subcategory.findOne({ _id });

      return this.saveAndGetNew(_id, parsedData);
    } catch (err) {
      return [];
    }
  };

  iterateCategories = async () => {
    let newOffers = {};

    for (const category of this.sourceData.categories) {
      for (const sub of category.subcategories) {
        newOffers[sub.title] = {
          new: await this.parseAndSave(sub, this.sourceData.selector),
          id: sub._id,
        };
      }
    }

    return newOffers;
  };

  init = async (callback) => {
    await this.fetchSourceData(this.sourceName);
    callback.bind(this)();
  };
}

module.exports = ParseWorker;
