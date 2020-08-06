const startDB = require("./db");
const ParseWorker = require("./parser/ParseWorker.js");
const bot = require("./telegram");

async function init() {
  await startDB();
  const weblancer = new ParseWorker("Weblancer");

  setInterval(function () {
    weblancer.init(async () => {
      let res = await weblancer.iterateCategories();

      Object.keys(res).forEach(function (key) {
        if (res[key].new.length) {
          for (msg in res[key].new) {
            console.log(res[key].new[msg]);
            bot.sendNotification(res[key].new[msg]);
          }
        }
      });
    });
  }, 30000);
}

init();
bot.startListener();
