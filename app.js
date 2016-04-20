//setup ports
const HTTP_PORT_NUMBER = 5000;
const MONGODB_PORT_NUMBER = 27017;

//setup variables
var express = require("express");
var app = express();
var mongodb = require("mongodb").MongoClient;
var url = 'mongodb://localhost:'+ MONGODB_PORT_NUMBER +'/fcc_url_shortener';
var baseConvert = require("./base_converter");

//define view engine
app.set("views", __dirname + "/views");
app.set("view engine", "pug");

/*
-------------
ROUTES
-------------
*/
app.get("/", function(req,res){
	res.render("index");
});

app.get("/new/:url", function(req,res){
	//initiate response header
	res.statusCode = 400;
	res.setHeader('Content-Type', 'application/json');   
	
	//validate URL
	var original_url = req.params.url;
	if (!/(?:https?:\/\/)?(?:[\w]+\.)([a-zA-Z\.]{2,6})([\/\w\.-]*)*\/?/.test(original_url)) {
		//not valid
		res.end(JSON.stringify({error : "Wrong url format, make sure you have a valid protocol and real site."}));
	}

	var base_url = req.protocol + "://" + req.hostname + "/";
	var date = new Date;
	var shortcode = baseConvert(+date.getTime());
	mongodb.connect(url, function(err,db){
		if (err) throw err;

		console.log('connection established');
		var collection = db.collection("dictionary");
		collection.insert(
			{
				original_url : original_url,
				short_url : base_url + shortcode
			},
			function(err, docs) {
				if (err) throw err;
				
				var result = {
					original_url : original_url,
					short_url : base_url + shortcode
				}
				res.end(JSON.stringify(result));
				db.close();
			}
		);
	});
});
app.get("/:short_url", function(req,res){

})

//start http server
app.listen(process.env.PORT || HTTP_PORT_NUMBER);
console.log("I'm listening...");