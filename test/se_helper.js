if (typeof client == "undefined") {
  client = null;
  beforeAll(function() {
    var webdriverjs = require("webdriverjs");
    client = webdriverjs.remote();
    client.init();
  });

  afterAll(function() {
    client.end();
  });
}
