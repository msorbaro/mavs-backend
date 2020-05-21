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

var cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// get config
var env = process.argv[2] || 'sunapee'; //use localhost if environment not specified
var config = require('./mavs_config')[env]; //read credentials from config.js
app.use(cors());


//Database connection
app.use(function(req, res, next){
	global.connection = mysql.createConnection({
		host     : config.database.host,
		user     : config.database.user,
		password : config.database.password,
		database : config.database.schema,
		insecureAuth : true
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


// GET for basic information on a single company
// nme = company name
router.get("/api/companies/:name/info",function(req,res1) {
	//Get hashed password and privileges
	global.connection.query('select c.CompanyName, c.CompanySize, c.CompanyField '+
		'from MAVS_sp20.Companies c where c.CompanyName like ?;',
		[req.params.name], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});

// GET for list of all companies
router.get("/api/companies",function(req,res1) {
	global.connection.query('select c.CompanyName ' +
		'from MAVS_sp20.Companies c;',
		[], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});


// GET for location/term info on all positions in a company
// name = company name
router.get("/api/companies/:name/positions",function(req,res1) {
	global.connection.query('select p.PositionID, p.PositionTitle, t.Year, t.Term, l.City, l.State as Position ' +
		'from MAVS_sp20.Positions p ' +
		'left join MAVS_sp20.Companies c on p.CompanyID = c.CompanyID '+
		'right join MAVS_sp20.OfferedTerms ot on p.PositionID = ot.PositionID ' +
		'right join MAVS_sp20.Terms t on ot.TermID = t.TermID ' +
		'right join MAVS_sp20.LocatedAt la on p.PositionID = la.PositionID ' +
		'right join MAVS_sp20.Locations l on la.LocationID = l.LocationID ' +
		'where c.CompanyName like ?;',
		[req.params.name], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});


// GET for term/location info for a specific position in a company
// name = company name, title = position title
router.get("/api/companies/:name/:title/info",function(req,res1) {
	global.connection.query('select p.PositionID, p.PositionTitle, t.Year, t.Term, l.City, l.State as Position ' +
		'from MAVS_sp20.Positions p ' +
		'left join MAVS_sp20.Companies c on p.CompanyID = c.CompanyID '+
		'right join MAVS_sp20.OfferedTerms ot on p.PositionID = ot.PositionID ' +
		'right join MAVS_sp20.Terms t on ot.TermID = t.TermID ' +
		'right join MAVS_sp20.LocatedAt la on p.PositionID = la.PositionID ' +
		'right join MAVS_sp20.Locations l on la.LocationID = l.LocationID ' +
		'where c.CompanyName like ? and p.PositionTitle like ?;',
		[req.params.name, req.params.title], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});


// GET for all relevant info for every review on a position within a company
// name = company name, title = position title
router.get("/api/companies/:name/:title/reviews",function(req,res1) {
	//Get hashed password and privileges
	global.connection.query('select p.PositionTitle, r.ReviewDate, r.Rating, r.Comment, r.Anonymous, '+
	'u.FirstName, u.LastName, u.GradYear, u.Major '+
	'from MAVS_sp20.Reviews r '+
	'left join MAVS_sp20.Positions p on r.PositionID = p.PositionID '+
	'left join MAVS_sp20.Companies c on p.CompanyID = c.CompanyID '+
	'left join MAVS_sp20.UserProfiles u on r.PersonID = u.PersonID '+
	'where p.PositionTitle like ? and c.CompanyName like ?;',
		[req.params.title, req.params.name], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});


// GET to view information within a user's profile
router.get("/api/users/:name",function(req,res1) {
	//Get hashed password and privileges
	global.connection.query('select Email, FirstName, LastName, GradYear, Major '+
		'from MAVS_sp20.UserProfiles '+
		'where Email like ?;',
		[req.params.name], function (err, res2) {
			if (err) console.log("error");
			console.log(res2)
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});

// PATCH to update desired info in a user profile
// name = user's email address (functions as their username)
router.patch("/api/users/:name",function(req,res1){
	//Get hashed password and privileges
	global.connection.query('SELECT * from MAVS_sp20.UserProfiles WHERE Email LIKE ?', [req.params.name], function (error, results) {
		if (error) throw error;
		console.log(results.length)
		console.log(results)
		if (results.length === 0){
			res1.send(JSON.stringify({"status": 200, "error": null, "response": false}));
		}
		else{
			var return_results = [];
			// Only update attributes that changed
			for (var col in req.body) {
				// Make sure to hash password if changed
				if (col.toLowerCase() == 'password') {
					bcrypt.hash(req.body[col], saltRounds, function (err, hash) {
						global.connection.query('UPDATE MAVS_sp20.UserProfiles SET Password = ? WHERE Email = ?;',
							[hash, req.params.name], function (error, results) {
							if (error) res1.send(JSON.stringify({
								"status": 500,
								"error": "SQL Error",
								"response": "Something is likely wrong with your inputs"
							}));
							return_results.push(results);
						});
					});
				}
				else {
					global.connection.query('UPDATE MAVS_sp20.UserProfiles SET ?? = ? WHERE Email = ?;',
						[col, req.body[col], req.params.name], function (error, results) {
						if (error) res1.send(JSON.stringify({
							"status": 500,
							"error": "SQL Error",
							"response": "Something is likely wrong with your inputs"
						}));
						return_results.push(results);
					});
				}
			}
			res1.send(JSON.stringify({"status": 200, "error": null, "response": return_results}));
		}
	});
});


// PUT to verify a user's email and password
router.put("/api/signin",function(req,res){
	console.log("at the backend!");
	global.connection.query('SELECT * from MAVS_sp20.UserProfiles WHERE Email LIKE ?', [req.body['email']], function (error, results) {
		if (error) throw error;
		console.log(results.length)
		console.log(results)
		if (results.length === 0){
			res.send(JSON.stringify({"status": 200, "error": null, "response": false}));
		}
		else{
			bcrypt.compare(req.body['password'], results[0]['Password'], function(err, result) {
				if (result === true){
					console.log(results)
					res.send(JSON.stringify({"status": 200, "error": null, "response": true}));
				}
				else {
					res.send(JSON.stringify({"status": 200, "error": null, "response": false}));
				}
			});
		}
	});
});


// POST to add a new user to the system
router.post("/api/signup",function(req,res) {
	console.log("Back end bithc")
	bcrypt.genSalt(saltRounds, function(err, salt) {
		bcrypt.hash(req.body['password'], salt, function(err, hash) {
			console.log(req.body.email);
			console.log("this is the email apparently");
			console.log(req.body);
			console.log("this is the whole body");
			global.connection.query('SELECT * FROM MAVS_sp20.UserProfiles WHERE Email = ?', [req.body.email], function (error, results) {
				console.log("made it here")
				if (error) throw error;
				if (results.length > 0) {
					console.log("In this error)")
					res.send(JSON.stringify({"status": 200, "error": null, "response": "Already Exists"}));
				} else {
					global.connection.query('INSERT INTO MAVS_sp20.UserProfiles(Email, FirstName, LastName, GradYear, Major, `Password`) ' +
						'VALUES (?, ?, ?, ?, ?, ?);', [req.body['email'], req.body['username'], null, null, null, hash], function (error) {
						console.log("here i am once again")
						if (error) throw error;
						console.log("should be sending it")
						res.send(JSON.stringify({"status": 200, "error": null, "response": "Added"}));
					});
				}

			});
		});
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
