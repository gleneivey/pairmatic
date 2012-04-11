require ('./se_helper');

describe("PairMatic in the browser", function() {
  it("Loads the page for the PairMatic app", function() {
    var done = false;

    runs(function() {
      client.url("http://localhost:4242/");
      client.waitFor("body", 5000, function(wasFound) {
	done = true;
        expect(wasFound).toBeTruthy();
      });
    });

    waitsFor(function() { return done; });

    runs(function() {
      done = false;
      client.getText("*", function(source) { console.log(source); });
      client.getTitle(function(titleResult) {
	done = true;
	expect(titleResult).toEqual("PairMatic for My Team");
      });
    });

    waitsFor(function() { return done; });
  });
});
