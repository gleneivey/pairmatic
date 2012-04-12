jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000; // sometimes a little slow, esp. on startup


if (typeof client == "undefined") {
  client = null;
  latestWebdriverRequestDone = false;

  waitsForDone = function() {
    waitsFor(function() {
      var maybeTrue = latestWebdriverRequestDone;
      latestWebdriverRequestDone = false;
      return maybeTrue;
    });
  };

  sayDone = function() {
    latestWebdriverRequestDone = true;
  };

  runsAndWaits = function(functionToRun) {
    runs(function() {
      latestWebdriverRequestDone = false;
      functionToRun();
    });
    waitsForDone();
  };

  beforeAll(function() {
    var webdriverjs = require("webdriverjs");
    client = webdriverjs.remote();
    client.init();
  });

  afterAll(function() {
    client.end();
  });
}
