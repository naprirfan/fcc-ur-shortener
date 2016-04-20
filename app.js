//setup ports
const HTTP_PORT_NUMBER = 5000;
const MONGODB_PORT_NUMBER = 27017;

//setup variables
var express = require("express");
var app = express();
var mongodb = require("mongodb").MongoClient;
var db_url = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:'+ MONGODB_PORT_NUMBER +'/fcc_url_shortener';
  
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
	if (!/https?:\/\/(?:[\w]+\.)([a-zA-Z\.]{2,6})([\/\w\.-]*)*\/?/.test(original_url)) {
		//not valid
		res.end(JSON.stringify({error : "Wrong url format, make sure you have a valid protocol and real site."}));
	}

	var base_url = req.protocol + "://" + req.hostname + "/";
	var date = new Date;
	var shortcode = baseConvert(+date.getTime());
	mongodb.connect(db_url, function(err,db){
		if (err) throw err;
		
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
	var base_url = req.protocol + "://" + req.hostname + "/" + req.params.short_url;
	mongodb.connect(db_url, function(err,db){
		if (err) throw err;
		
		var collection = db.collection("dictionary");
		collection.find(
			{
				short_url : base_url
			}
		).toArray(function(err, docs){
			if (err) throw err;
			if (!docs[0]) {
				res.statusCode = 400;
				res.setHeader('Content-Type', 'application/json');   
				res.end(JSON.stringify({"error" : "URL not exist!"}))
			}
			else {
				res.redirect(301, docs[0].original_url);	
			}
			db.close();
		});
	});
});

//start http server
app.listen(process.env.PORT || HTTP_PORT_NUMBER);
console.log("I'm listening...");