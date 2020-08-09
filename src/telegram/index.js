process.env.NODE_CONFIG_DIR = "../config";
const config = require("config");
const TelegramBot = require("node-telegram-bot-api");
const token = config.get("tg_bot_key");
const mongoose = require("mongoose");
const User = require("../db/models/User.js");
const bot = new TelegramBot(token, { polling: true });
const db = require("../db");

function getInlineKeyboard(array, action) {
  const opts = {
    reply_markup: {
      inline_keyboard: [
        ...array.map(({ title }) => [
          {
            text: title,
            callback_data: `${title}`,
          },
        ]),
      ],
    },
  };
  return opts;
}

module.exports = {
  startListener() {
    bot.onText(/\/start/, ({ from, chat }, match) => {
      bot.sendMessage(
        chat.id,
        "Уведомления о новых заказах на сайте Weblancer.net\nДля настройки категорий воспользуйтесь командой /category"
      );
      this.saveUser(from);
    });

    bot.onText(/\/category/, async ({ chat }) => {
      const { categories } = await db.getSource("Weblancer");
      bot.sendMessage(chat.id, "Категории", getInlineKeyboard(categories));
    });

    bot.on("callback_query", async function onCallbackQuery(query) {
      const message_id = query.message.message_id,
        chat_id = query.message.chat.id,
        data = query.data,
        type = query.message.text;
      console.log({
        chat_id,
        message_id,
      });
      if (type == "Категории") {
        const category = await db.getCategory(data);
        bot.editMessageReplyMarkup(getInlineKeyboard(category).reply_markup, {
          chat_id,
          message_id,
        });
      }
    });
  },
  saveUser(user, category) {
    category = category || [];
    let doc = new User({
      ...user,
      category,
    });

    doc.save();
  },
  async sendNotification({ title, description, price, url }) {
    const users = await User.find({});
    for (user in users) {
      if (users[user].id) {
        bot
          .sendMessage(
            users[user].id,
            `${title}\n\n${description}\n\n${
              price ? "Цена: " + price : ""
            }\n\n${url}`
          )
          .catch((err) => {
            console.log(err);
          });
      }
    }
  },
};
