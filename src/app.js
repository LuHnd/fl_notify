const startDB = require("./db");
const ParseWorker = require("./parser/ParseWorker.js");
const bot = require("./telegram");

function updOrders(fl_site) {
  fl_site.init(async () => {
    let res = await fl_site.iterateCategories();
    console.log(res);
    Object.keys(res).forEach(function (key) {
      if (res[key].new.length) {
        for (msg in res[key].new) {
          bot.sendNotification(res[key].new[msg]);
        }
      }
    });
  });
}

async function init() {
  await db.startDB();
  const weblancer = new ParseWorker("Weblancer");

  setInterval(function () {
    updOrders(weblancer);
  }, 30000);

  //updOrders(weblancer);
}

init();
bot.startListener();
