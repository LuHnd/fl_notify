const db = require("./db");
const ParseWorker = require("./parser/ParseWorker.js");
const bot = require("./telegram");

function updOrders(fl_site) {
  fl_site.init(async () => {
    let res = await fl_site.iterateCategories();
    console.log(res);
    Object.keys(res).forEach(function (key) {
      if (res[key].new.length) {
        for (msg in res[key].new) {
          bot.sendNotification(res[key].new[msg], res[key]);
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
  }, 2 * 60000);

  //updOrders(weblancer);

  // let categories = await weblancer.getCategories(
  //   "https://www.weblancer.net",
  //   "/jobs/"
  // );
  // db.setCategories("Weblancer", categories);

  //console.log(db.getCategories());
}

init();
bot.startListener();
