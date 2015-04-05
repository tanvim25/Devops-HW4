var http      = require('http');
var httpProxy = require('http-proxy');
var exec = require('child_process').exec;
var request = require("request");

var GREEN = 'http://127.0.0.1:3002';
var BLUE  = 'http://127.0.0.1:9090';

var TARGET = GREEN;

var infrastructure =
{
  setup: function()
  {
    // Proxy.
    var options = {};

    var proxy   = httpProxy.createProxyServer(options);

    var server  = http.createServer(function(req, res)
    {
      proxy.web( req, res, {target: GREEN } );
    });
    server.listen(8080);

    // Launch green slice
    exec('forever start --watch --watchDirectory ../deploy/blue-www ../deploy/blue-www/main.js 6375');
    console.log("blue slice");

    // Launch blue slice
    exec('forever start --watch --watchDirectory ../deploy/green-www ../deploy/green-www/main.js 6379');
    console.log("green slice");

},

  teardown: function()
  {
    exec('forever stopall', function()
    {
      console.log("infrastructure shutdown");
      process.exit();
    });
  },
}

infrastructure.setup();

// Make sure to clean up.
process.on('exit', function(){infrastructure.teardown();} );
process.on('SIGINT', function(){infrastructure.teardown();} );
process.on('uncaughtException', function(err){
  console.log(err);
  infrastructure.teardown();} );
