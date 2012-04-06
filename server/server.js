(function(root) {
  var pairmatic = root.pairmatic = {};
  root._ = require('underscore')._;
  root.Backbone = require('backbone');

  require('../lib/application');
  require('../lib/models/person');
  require('../lib/models/people');

  pairmatic.app = new pairmatic.Application(
   [
      [ "mark",      "Mark",      "mm",  "D",  "Ruby", "9e3861569add09d7787c95faadb98388" ],
      [ "nick",      "Nick",      "nrs", "D",  "Ruby", "a6843e2d31781a378deb73b6d8656e26" ],
      [ "glen",      "Glen",      "gi",  null, "Ruby", "givey@pivotallabs.com" ],
      [ "lewis",     "Lewis",     "lh",  "D",  "Ruby", "620cd525ccfe6f73044251c71e8d26f7" ],
      [ "chad",      "Chad",      "caw", null, "Ruby", "68613e8fd136bfddcdedd16b0bfa671f" ],
      [ "alex",      "Alex",      "aj",  "D",  "Ruby", "181cd2efadf4ee8155ed587e2fffbc5c" ],
      [ "matt",      "Matt",      "mh",  "D",  "Ruby", "208c855e1ed834f1d938e23fe747a549" ],
      [ "thomas",    "Thomas",    "tb",  "SF", "Ruby", "4a4dd769149baedf9212e7af94c6c11c" ],
      [ "david",     "David",     "ds",  "SF", "Ruby", "6da8384aa1243b708fafd402922b478e" ],
      [ "ryan",      "Ryan",      "rd",  "SF", "Ruby", "ca2b32f1bf5d4efdf458c7d2053a92fd" ],
      [ "christian", "Christian", "cn",  "SF", "iOS",  "83d5299619b88c68e6360e4d05d1535f" ],
      [ "johan",     "Johan",     "ji",  "SF", "iOS",  "f776e4d17f98770fc6b127907cf302a5" ],
      [ "dan",       "Dan",       "dp",  null, null,   "ed2a327e601de8f01d9d0d728c480fa4" ],
      [ "chris",     "Chris",     "ct",  null, null,   "8a858ed4ebd2d2809c38b30b1135fd41" ],
      [ "jo",        "Jo",        "jw",  null, null,   "efaa5e89a9fccfaf656dd34673d3e518" ]
    ]
  );
})(global);

