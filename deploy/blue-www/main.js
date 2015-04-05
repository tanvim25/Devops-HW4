var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
var app_proxy = express()
//oo REDIS

var client = redis.createClient(6379, '127.0.0.1', {})
//client.flushdb()
///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log(req.method, req.url);

	// ... INSERT HERE.
	client.lpush("recent", req.url);

	next(); // Passing the request to the next handler in the stack.
});

app_proxy.use(function(req, res, next)
{
	client.rpoplpush("url","url",function(err,value){
		console.log(value+req.url);
		//console.log(req.url);
		//res.send();
		//client.lpush("recent", req.url);
		res.redirect(value+req.url);
		
		//next();
	})

})
app.get('/get', function(req, res) {
client.get("msg", function(err,value){res.send(value)});})

app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files
	
   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		console.log(img)
	  		client.lpush("upload",img);
		});
	}

    res.status(204).end()
 }]);

app.get('/meow', function(req, res) {
	
		client.lpop('upload',function(err,imagedata){
		if (err) throw err;
		res.writeHead(200, {'content-type':'text/html'});
		
		//items.forEach(function (imagedata) 
		//{			
   		res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
		//})
	
   	res.end();
	})
});

// HTTP SERVER
var server1 = app.listen(3000, function () {

  var host = server1.address().address
  var port = server1.address().port

  console.log('Example app listening at http://%s:%s', host, port)
  //client.lpush("url", "http://"+host+":"+port);
  client.lpush("url", "http://localhost:"+port);
})
// 2nd HTTP SERVER
var server2 = app.listen(3001, function () {

  var host = server2.address().address
  var port = server2.address().port

  console.log('Example app listening at http://%s:%s', host, port)
  client.lpush("url", "http://localhost:"+port);
  //client.lpush("url", "http://"+host+":"+port);
})
//Proxy Server
var proxy = app_proxy.listen(3002, function () {

	var host = proxy.address().address
	var port = proxy.address().port

	console.log('Example app listening at http://%s:%s', host, port)

 })

app.get('/', function(req, res) {
  res.send('hello world')
})

app.get('/set', function(req, res) {
  client.set("msg", "this message will self-destruct in 10 seconds");
 client.expire("msg",10);
  res.send('test set world')
})

app.get('/get', function(req, res) {
client.get("msg", function(err,value){res.send(value)});

})
app.get('/recent', function(req, res) {
client.lrange("recent",0,5,function(err,value){
res.send(value)});
})

//app.get('/upload', function(req, res) {
//client.lrange("recent",0,5,function(err,value){
//res.send(value)});
//})
// comment
// comment
// comment
// comment
