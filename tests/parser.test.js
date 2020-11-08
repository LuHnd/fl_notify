const ParseWorker = require("../src/parser/ParseWorker.js");

const parser = new ParseWorker("Weblancer");

test("create ParseWorker", () => {
  expect(parser).toBeDefined();
});

test("create ParseWorker", () => {
  parser.init(async () =>
    parser.iterateCategories(function (newOffers) {
      expect(typeof newOffers).toBe("object");
    })
  );
});
