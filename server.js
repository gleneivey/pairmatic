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


var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(80);

function handler (req, res) {
  var url = req.url;
  if (url == '/') { url = '/index.html'; }
console.log(__dirname);
console.log(url);
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


io.sockets.on('connection', function (socket) {
    socket.on('drop', function (data) {
        socket.broadcast.emit('drop', data);
    });
});
