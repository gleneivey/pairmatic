describe("Person", function() {
  require('../../pairmatic_helper.js');
  require('../../../lib/models/person.js');

  it("initializes from an array of values", function() {
    var person = new global.pairmatic.Person({
        id: "person",
        name: "Person",
        initials: "p",
        location: "L",
        group: "group",
        avatar: "hash"
    });

    expect(person.id).toEqual("person");
    expect(person.get('id')).toEqual("person");
    expect(person.get('name')).toEqual("Person");
    expect(person.get('initials')).toEqual("p");
    expect(person.get('location')).toEqual("L");
    expect(person.get('group')).toEqual("group");
    expect(person.get('avatar')).toEqual("hash");
  });
});
