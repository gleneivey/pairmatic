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
var personData = [
    [ "mark",      "Mark",      "mm",  "D",  null ],
    [ "nick",      "Nick",      "nrs", "D",  "seemiller@pivotallabs.com" ],
    [ "glen",      "Glen",      "gi",  null, "givey@pivotallabs.com" ],
    [ "lewis",     "Lewis",     "lh",  "D",  null ],
    [ "chad",      "Chad",      "caw", null, "chad@pivotallabs.com" ],
    [ "alex",      "Alex",      "aj",  "D",  null ],
    [ "matt",      "Matt",      "mh",  "D",  null ],
    [ "thomas",    "Thomas",    "tb",  "SF", "thomas@pivotallabs.com" ],
    [ "david",     "David",     "ds",  "SF", "stevend@pivotallabs.com" ],
    [ "jordi",     "Jordi",     "jn",  "SF", null ],
    [ "christian", "Christian", "cn",  "SF", "cniles@pivotallabs.com" ],
    [ "johan",     "Johan",     "ji",  "SF", null ],
    [ "dan",       "Dan",       "dp",  null, "dan@pivotallabs.com" ],
    [ "chris",     "Chris",     "ct",  null, "ctong@pivotallabs.com" ],
    [ "jo",        "Jo",        "jw",  null, null ]
  ];


// browser-to-browser relay
io.sockets.on('connection', function (socket) {
  socket.emit('init', {
      'state': pairingState,
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
    socket.broadcast.emit('reset', {});
  });
  socket.on('move', function(data){
    socket.broadcast.emit('move', data);
  });
});
