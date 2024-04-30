var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname +  '/public/landing.html');
});

var server = app.listen(process.env.PORT || 5000, function() {
  var port = server.address().port;
  var url = `http://localhost:${port}`;

//   var start =
//     process.platform == "darwin"
//       ? "open"
//       : process.platform == "win32"
//       ? "start"
//       : "xdg-open";
//   require("child_process").exec(start + " " + url);
  console.log(`[CONSOLE] App now running on port ${port} 🚀`);
});