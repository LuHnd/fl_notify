process.env.NODE_CONFIG_DIR = "../config";
const config = require("config");
const TelegramBot = require("node-telegram-bot-api");
const token = config.get("tg_bot_key");
const mongoose = require("mongoose");
const User = require("../db/models/User.js");
const bot = new TelegramBot(token, { polling: true });

module.exports = {
  startListener() {
    bot.onText(/\/start/, ({ from }, match) => {
      this.saveUser(from);
    });
  },
  saveUser(user) {
    let doc = new User({
      ...user,
    });

    doc.save();
  },
  async sendNotification({ title, description, price, url }) {
    const users = await User.find({});
    for (user in users) {
      if (users[user].id) {
        bot.sendMessage(
          users[user].id,
          `*${title}*\n\n${description}\n\n${
            price ? "Цена: " + price : ""
          }\n\n${url}`,
          { parse_mode: "Markdown" }
        );
      }
    }
  },
};
