var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(80);

function handler (req, res) {
  var url = req.url;
  if (url == '/') { url = '/index.html'; }
console.log(__dirname);
console.log(url);
  fs.readFile(__dirname + '/../client' + url,
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
