/* 	Node API demo
	Author: Tim Pierson, Dartmouth CS61, Spring 2020

	Add config.js file to root directory
	To run: nodemon api.js <local|sunapee>
	App will use the database credentials and port stored in config.js for local or sunapee server
	Recommend Postman app for testing verbs other than GET, find Postman at https://www.postman.com/
*/

const bcrypt = require('bcrypt');
const saltRounds = 10;
const someOtherPlaintextPassword = 'not_bacon';

var express=require('express');
let mysql = require('mysql');
const bodyParser = require('body-parser'); //allows us to get passed in api calls easily
var app=express();

// get config
var env = process.argv[2] || 'local'; //use localhost if enviroment not specified
var config = require('./config')[env]; //read credentials from config.js


//Database connection
app.use(function(req, res, next){
	global.connection = mysql.createConnection({
		host     : config.database.host,
		user     : config.database.user,
		password : config.database.password,
		database : config.database.schema
	});
	connection.connect();
	next();
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// set up router
var router = express.Router();

// log request types to server console
router.use(function (req,res,next) {
	console.log("/" + req.method);
	next();
});

// set up routing
// calls should be made to /api/restaurants with GET/PUT/POST/DELETE verbs
// you can test GETs with a browser using URL http://localhost:3000/api/restaurants or http://localhost:3000/api/restaurants/30075445
// recommend Postman app for testing other verbs, find it at https://www.postman.com/
router.get("/",function(req,res){
	res.send("Yo!  This my API.  Call it right, or don't call it at all!");
});

// GET - read data from database, return status code 200 if successful
router.get("/api/employees",function(req,res){
	// get all restaurants (limited to first 10 here), return status code 200
	global.connection.query('SELECT * FROM nyc_inspections.Employees', function (error, results, fields) {
		if (error) throw error;
		res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
	});
});

router.get("/api/employees/:id",function(req,res){
	//read a single restaurant with RestauantID = req.params.id (the :id in the url above), return status code 200 if successful, 404 if not
	global.connection.query('SELECT * FROM nyc_inspections.Employees WHERE EmployeeID = ?', [req.params.id],function (error, results, fields) {
		if (error) throw error;
		res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
	});
});

// PUT - UPDATE data in database, make sure to get the ID of the row to update from URL route, return status code 200 if successful
router.put("/api/employees/:id",function(req,res){
  global.connection.query('UPDATE nyc_inspections.Employees SET Salary = ?, `Name` = ?, Username = ?, `Password` = ?, HasAdminPrivilege = ? WHERE EmployeeID = ?', [req.body.salary, req.body.name, req.body.username, req.body.password, req.body.isAdmin, req.params.id],function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify({"status": 200, "error": null, "response": "updated"}));
  });

});

// POST -- create new restaurant, return location of new restaurant in location header, return status code 200 if successful
router.post("/api/employees",function(req,res){


	bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
			var size;
			global.connection.query('SELECT * FROM nyc_inspections.Employees WHERE Username = ?', [req.body.username],function (error, results, fields) {
				if (error) throw error;
				if(results.length > 0){
					res.send(JSON.stringify({"status": 200, "error": null, "response": "Already Exists"}));
				}
				else{
					global.connection.query('INSERT INTO nyc_inspections.Employees ( Salary, HasAdminPrivilege, `Name`, Username, `Password`) VALUES (?, ?, ?, ?, ?) ', [req.body.salary, req.body.isAdmin, req.body.name, req.body.username, hash],function (error, results, fields) {
						if (error) throw error;
						res.send(JSON.stringify({"status": 200, "error": null, "response": "Added"}));
					});
				}

			});
    });
	});





  //
	// res.send(JSON.stringify({"status": 201, "error": null,
	// 	"Location":"/api/restaurants/id of new restaurant here",
	// 	"response": "here on a post -- create a new restaurant for " + req.body.RestaurantName + " in " +req.body.Boro}));
});

// DELETE -- delete restaurant with RestaurantID of :id, return status code 200 if successful
router.delete("/api/employees/:id",function(req,res){
	global.connection.query('SELECT * FROM nyc_inspections.Employees WHERE EmployeeID = ?', [req.params.id],function (error, results, fields) {
		if(results.length === 0){
				res.send(JSON.stringify({"status": 200, "error": null, "response": false}));
		}
		else {
		  global.connection.query('DELETE FROM nyc_inspections.Employees WHERE EmployeeID = ?', [req.params.id],function (error, results, fields) {
		    if (error) throw error;
		    res.send(JSON.stringify({"status": 200, "error": null, "response": "here on a delete -- remove restaurant with RestaurantID=" + req.params.id}));
		  });
		}
	});
});


// router thing
  //Select from Employees where Emplyee ID = 3
	// if repomse.password = reqiest.passwork -> good

	router.put("/api/signin",function(req,res){

		global.connection.query('SELECT * from nyc_inspections.Employees WHERE Username LIKE ?', [req.body.username], function (error, results, fields) {
			if (error) throw error;
			console.log(results.length)
			console.log(results)
			if (results.length === 0){
				res.send(JSON.stringify({"status": 200, "error": null, "response": false}));
			}
			else{
				bcrypt.compare(req.body.password, results[0].Password, function(err, result) {
					if (result === true){
						console.log(results)
						if(results[0].HasAdminPrivilege === 1){
							res.send(JSON.stringify({"status": 200, "error": null, "response": "admin"}));
						}
						else{
							res.send(JSON.stringify({"status": 200, "error": null, "response": results[0]}));
						}
					}
					else {
						res.send(JSON.stringify({"status": 200, "error": null, "response": false}));
					}
				});
			}
		});
	});


// start server running on port 3000 (or whatever is set in env)
app.use(express.static(__dirname + '/'));
app.use("/",router);
app.set( 'port', ( process.env.PORT || config.port || 3000 ));

app.listen(app.get( 'port' ), function() {
	console.log( 'Node server is running on port ' + app.get( 'port' ));
	console.log( 'Environment is ' + env);
});
