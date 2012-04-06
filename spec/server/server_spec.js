describe("server initialization", function() {
  require('../../server/server');

  it("creates a top-level PairMatic scope", function() {
    expect(global.pairmatic).toBeDefined();
    expect(pairmatic).toBeDefined();
    expect(global.pairmatic).toEqual(pairmatic);
  });

  it("instantiates an application object", function() {
    expect(pairmatic.app).toBeDefined();
    expect(pairmatic.app instanceof pairmatic.Application).toBeTruthy();
  });

  it("loads the application with data", function() {
    expect(pairmatic.app.people).toBeDefined();
    expect(pairmatic.app.people instanceof pairmatic.People).toBeTruthy();
    expect(pairmatic.app.people.length).toBeGreaterThan(10);
  });
});
