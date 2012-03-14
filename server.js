// PairMatic - a real-time remote pair coordinating web app
// Copyright (C) 2012 - Glen E. Ivey
// https://github.com/gleneivey/pairmatic
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License version
// 3 as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program in the file COPYING and/or LICENSE. If not,
// see <http://www.gnu.org/licenses/>.


function removeHashEntryByValue(h, v){
  for (var k in h) {
    if (h[k] == v) {
      delete h[k];
    }
  }
}



var
  app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  fs = require('fs');

app.listen(80);


// trivial static-file server
function handler (req, res) {
  var url = req.url;
  if (url == '/') { url = '/index.html'; }
  if (url == '/favicon.ico') { url = '/vendor/favicon.ico'; }
  fs.readFile(__dirname + '/client' + url,
      function (err, data) {
	if (err) {
	  res.writeHead(500);
	  return res.end('Error loading "' + url + '"');
	}

	res.writeHead(200);
	res.end(data);
      }
  );
}


var pairingState = {};
var pairNotes = {};
var discussionItems = {};
var personData = [
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
  ];


// browser-to-browser relay
io.sockets.on('connection', function (socket) {
  socket.emit('init', {
      'state': pairingState,
      'notes': pairNotes,
      'discussionItems': discussionItems,
      'personData': personData
  });
  socket.on('pair', function(data) {
    removeHashEntryByValue(pairingState, data.person);
    pairingState[data.target] = data.person;
    socket.broadcast.emit('pair', data);
  });
  socket.on('unpair', function(data) {
    removeHashEntryByValue(pairingState, data.person);
    socket.broadcast.emit('unpair', data);
  });
  socket.on('reset', function(){
    pairingState = {};
    pairNotes = {};
    socket.broadcast.emit('reset', {});
  });
  socket.on('note', function(data){
    pairNotes[data.target] = data.note;
    socket.broadcast.emit('note', data);
  });
  socket.on('di', function(data){
    discussionItems[data.target] = data.item;
    socket.broadcast.emit('di', data);
  });
  socket.on('move', function(data){
    socket.broadcast.emit('move', data);
  });
});
