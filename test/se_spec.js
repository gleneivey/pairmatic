require ('./se_helper');

describe("PairMatic in the browser", function() {
  it("Loads the page for the PairMatic app", function() {
    var done = false;

    runs(function() {
      client.
	  url("http://localhost:4242/").
          getTitle(function(titleResult) {
            expect(titleResult).toEqual("PairMatic for My Team");
            sayDone();
          });
    });

    waitsForDone();
  });
});
