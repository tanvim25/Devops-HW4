var http      = require('http');
var httpProxy = require('http-proxy');
var exec = require('child_process').exec;
var request = require("request");
var redis = require('redis');

var GREEN = 'http://127.0.0.1:3002';
var BLUE  = 'http://127.0.0.1:3001';

var args = process.argv.slice(2);
var MIRROR = args[0];

var TARGET = BLUE;
var AUX = GREEN;
//var REDIS_PORT = 6375;
var client_blue = redis.createClient(6375, '127.0.0.1', {});
var client_green = redis.createClient(6379, '127.0.0.1', {});

var infrastructure =
{
  setup: function()
  {
    // Proxy.
    var options = {};

    var proxy   = httpProxy.createProxyServer(options);

    var server  = http.createServer(function(req, res)
    {
      
      //console.log(req.url);
      
      if(req.url=="/switch")
      {
        //console.log("switchh");
        AUX=TARGET;
        if(TARGET== BLUE)
          {//set target green
            TARGET = GREEN;
            console.log("green redis");
            if(MIRROR!=1)
            {
              console.log("switch");
            client_blue.lrange("upload",0,-1,function(err,value){

              value.forEach(function(data){
                client_green.lpush("upload",data);
              });
            });
            //REDIS_PORT=6379;
           }
          }
        else
          {//set target blue
            TARGET = BLUE;
            console.log("blue redis");
            if(MIRROR!=1)
            {
              console.log("switch");
            client_green.lrange("upload",0,-1,function(err,value){

              value.forEach(function(data){
                client_blue.lpush("upload",data);
              });
            });
            //REDIS_PORT=6375;
          }
          }
      } 
     
      if(MIRROR==1 && req.url == "/upload")
      { //mirroring is on
        req.pipe(request.post(AUX+req.url));
      }
        
      proxy.web( req, res, {target: TARGET } );
      
    });
    server.listen(8080);

    // Launch green slice
    exec('forever start --watch --watchDirectory ../deploy/blue-www ../deploy/blue-www/main.js 3001 6375');
    console.log("blue slice");

    // Launch blue slice
    exec('forever start --watch --watchDirectory ../deploy/green-www ../deploy/green-www/main.js 3002 6379');
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
