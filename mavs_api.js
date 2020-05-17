/* 	Lab 3
	Authors: Tim Pierson, Dartmouth CS61, Spring 2020 (framework)
			Summer Christensen, Dartmouth CS61, Spring 2020

	Add config.js file to root directory
	To run: nodemon api.js <local|sunapee>
	App will use the database credentials and port stored in config.js for local or sunapee server
*/

var express = require('express');
let mysql = require('mysql');
const bodyParser = require('body-parser'); //allows us to get passed in api calls easily
var app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10;

// get config
var env = process.argv[2] || 'local'; //use localhost if environment not specified
var config = require('./mavs_config')[env]; //read credentials from config.js


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
router.get("/",function(req,res){
	res.send("Yo!  This my API.  Call it right, or don't call it at all!");
});


// // GET - read data from database, return status code 200 if successful
// router.get("/api/employees",function(req,res1){
// 	//Get hashed password and privileges
// 	global.connection.query('SELECT Password, Admin, EmployeeID FROM nyc_inspections.Employees WHERE Username = ? LIMIT 1;',
// 		[req.body["auth_name"]], function (err, res2) {
// 			if (err) console.log("error");
//
// 			if (res2.length > 0) {
// 				var hashed_password = res2[0]["Password"];
// 				var admin = res2[0]["Admin"];
// 				var employee_id = res2[0]["EmployeeID"];
//
// 				//Authenticate
// 				bcrypt.compare(req.body['auth_pass'], hashed_password, function (err, res) {
// 					if (err) console.log("error");
// 					if (res == true) {  //If username/password pair is good
// 						//Only view all if admin
// 						if (admin == 1) {
// 							global.connection.query('SELECT * FROM nyc_inspections.Employees LIMIT 10;', function (error, results, fields) {
// 								if (error) {
// 									res1.send(JSON.stringify({
// 										"status": 500,
// 										"error": "SQL Error",
// 										"response": "Something is likely wrong with your inputs"
// 									}));
// 								} else {
// 									res1.send(JSON.stringify({"status": 200, "error": null, "response": results}));
// 								}
// 							});
// 						}
// 						//Only view yourself if not admin
// 						else {
// 							global.connection.query('SELECT * FROM nyc_inspections.Employees WHERE EmployeeID = ?;', [employee_id], function (error, results, fields) {
// 								if (error) {
// 									res1.send(JSON.stringify({
// 										"status": 500,
// 										"error": "SQL Error",
// 										"response": "Something is likely wrong with your inputs"
// 									}));
// 								} else {
// 									res1.send(JSON.stringify({"status": 200, "error": null, "response": results}));
// 								}
// 							});
// 						}
// 					} else {
// 						console.log("Sorry, that username/password is not in our system.");
// 						res1.send(JSON.stringify({
// 							"status": 401, "error": "Bad Authentication", "response": "That username/password " +
// 								"does not exist in our system or you do not have sufficient privileges for that action."
// 						}));
// 					}
// 				});
// 			} else {
// 				res1.send(JSON.stringify({
// 					"status": 401, "error": "Bad Authentication", "response": "That username/password " +
// 						"does not exist in our system or you do not have sufficient privileges for that action."
// 				}));
// 			}
// 		});
// 	});

router.get("/api/companies/:name",function(req,res1) {
	//Get hashed password and privileges
	global.connection.query('select p.PositionTitle, t.Year, t.Term, l.City, l.State as Position ' +
		'from MAVS_sp20.Positions p ' +
		'right join MAVS_sp20.OfferedTerms ot on p.PositionID = ot.PositionID ' +
		'right join MAVS_sp20.Terms t on ot.TermID = t.TermID ' +
		'right join MAVS_sp20.LocatedAt la on p.PositionID = la.PositionID ' +
		'right join MAVS_sp20.Locations l on la.LocationID = l.LocationID ' +
		'where CompanyID IN ' +
		'(SELECT CompanyID FROM MAVS_sp20.Companies WHERE CompanyName like ?);',
		[req.params.name], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)});

// start server running on port 3000 (or whatever is set in env)
app.use(express.static(__dirname + '/'));
app.use("/",router);
app.set( 'port', ( process.env.PORT || config.port || 3000 ));

app.listen(app.get( 'port' ), function() {
	console.log( 'Node server is running on port ' + app.get( 'port' ));
	console.log( 'Environment is ' + env);
});
