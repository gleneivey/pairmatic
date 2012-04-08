(function(root) {
  var pairmatic = root.pairmatic = {};
  root._ = require('underscore')._;
  root.Backbone = require('backbone');

  require('../lib/application');
  require('../lib/models/person');
  require('../lib/models/people');

  pairmatic.app = new pairmatic.Application(
   [
      { id: "mark",      name: "Mark",      initials: "mm",  location: "D",  group: "Ruby", avatar: "9e3861569add09d7787c95faadb98388" },
      { id: "nick",      name: "Nick",      initials: "nrs", location: "D",  group: "Ruby", avatar: "a6843e2d31781a378deb73b6d8656e26" },
      { id: "glen",      name: "Glen",      initials: "gi", location:  null, group: "Ruby", avatar: "givey@pivotallabs.com" },
      { id: "lewis",     name: "Lewis",     initials: "lh",  location: "D",  group: "Ruby", avatar: "620cd525ccfe6f73044251c71e8d26f7" },
      { id: "chad",      name: "Chad",      initials: "caw",location:  null, group: "Ruby", avatar: "68613e8fd136bfddcdedd16b0bfa671f" },
      { id: "alex",      name: "Alex",      initials: "aj",  location: "D",  group: "Ruby", avatar: "181cd2efadf4ee8155ed587e2fffbc5c" },
      { id: "matt",      name: "Matt",      initials: "mh",  location: "D",  group: "Ruby", avatar: "208c855e1ed834f1d938e23fe747a549" },
      { id: "thomas",    name: "Thomas",    initials: "tb",  location: "SF", group: "Ruby", avatar: "4a4dd769149baedf9212e7af94c6c11c" },
      { id: "david",     name: "David",     initials: "ds",  location: "SF", group: "Ruby", avatar: "6da8384aa1243b708fafd402922b478e" },
      { id: "ryan",      name: "Ryan",      initials: "rd",  location: "SF", group: "Ruby", avatar: "ca2b32f1bf5d4efdf458c7d2053a92fd" },
      { id: "christian", name: "Christian", initials: "cn",  location: "SF", group: "iOS",  avatar: "83d5299619b88c68e6360e4d05d1535f" },
      { id: "johan",     name: "Johan",     initials: "ji",  location: "SF", group: "iOS",  avatar: "f776e4d17f98770fc6b127907cf302a5" },
      { id: "dan",       name: "Dan",       initials: "dp", location:  null,group:  null,   avatar: "ed2a327e601de8f01d9d0d728c480fa4" },
      { id: "chris",     name: "Chris",     initials: "ct", location:  null,group:  null,   avatar: "8a858ed4ebd2d2809c38b30b1135fd41" },
      { id: "jo",        name: "Jo",        initials: "jw", location:  null,group:  null,   avatar: "efaa5e89a9fccfaf656dd34673d3e518" }
    ]
  );
})(global);

