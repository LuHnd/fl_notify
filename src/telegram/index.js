process.env.NODE_CONFIG_DIR = "../config";
const config = require("config"),
  TelegramBot = require("node-telegram-bot-api"),
  token = config.get("tg_bot_key"),
  mongoose = require("mongoose"),
  User = require("../db/models/User.js"),
  bot = new TelegramBot(token, { polling: true }),
  db = require("../db");

async function getInlineKeyboard(
  array,
  action,
  userCategories,
  displayStatus,
  displayBack
) {
  userCategories = userCategories || [];
  displayStatus = displayStatus || false;
  displayBack = displayBack || false;

  const opts = {
    reply_markup: {
      inline_keyboard: [
        ...array.map(({ title }) => [
          {
            text:
              title +
              (displayStatus
                ? userCategories.includes(title)
                  ? " 🟢"
                  : " 🔴"
                : ""),
            callback_data: `${action}/${title}`,
          },
        ]),
      ],
    },
  };

  if (displayBack) {
    opts.reply_markup.inline_keyboard.push([
      {
        text: "Назад",
        callback_data: `back`,
      },
    ]);
  }

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
      bot.sendMessage(
        chat.id,
        "Категории",
        await getInlineKeyboard(categories, "sc")
      );
    });

    bot.on("callback_query", async function onCallbackQuery(query) {
      const message_id = query.message.message_id,
        chat_id = query.message.chat.id,
        data = query.data.split("/"),
        msg = query.message.text,
        type = query.message.text;

      if (data[0] == "sc") {
        const category = await db.getCategory(data[1]);
        const user = await db.user.getUser(chat_id);
        console.log(user);
        const keyboard = await getInlineKeyboard(
          category,
          "ssc",
          user.categories,
          true,
          true
        );
        await bot.editMessageText(data[1], {
          chat_id,
          message_id,
        });
        await bot.editMessageReplyMarkup(keyboard.reply_markup, {
          chat_id,
          message_id,
        });
      }

      if (data[0] == "ssc") {
        const category = await db.getCategory(msg);
        let { categories } = await db.user.updateCategory(chat_id, data[1]);
        const keyboard = await getInlineKeyboard(
          category,
          "ssc",
          categories,
          true,
          true
        );
        bot.editMessageReplyMarkup(keyboard.reply_markup, {
          chat_id,
          message_id,
        });
      }

      if (data[0] == "back") {
        const { categories } = await db.getSource("Weblancer");
        const keyboard = await getInlineKeyboard(categories, "sc");
        await bot.editMessageText("Категории", {
          chat_id,
          message_id,
        });
        await bot.editMessageReplyMarkup(keyboard.reply_markup, {
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
  async sendNotification({ title, description, price, url }, category) {
    const users = await User.find({ category });
    console.log(users);
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
