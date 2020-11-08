const db = require("./db");
const ParseWorker = require("./parser/ParseWorker.js");
const telegram = require("./telegram");

function updOrders(fl_site) {
  fl_site.init(async () =>
    fl_site.iterateCategories(function (newOffers) {
      Object.keys(newOffers).forEach(function (key) {
        if (newOffers[key].new.length) {
          for (let msg in newOffers[key].new) {
            telegram.sendNotification(newOffers[key].new[msg], key);
          }
        }
      });
    })
  );
}

async function init() {
  await db.startDB();
  const weblancer = new ParseWorker("Weblancer");
  updOrders(weblancer);
  setInterval(function () {
    updOrders(weblancer);
  }, 5 * 60000);
}

init();
telegram.startListener();
