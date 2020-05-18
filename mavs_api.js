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
var env = process.argv[2] || 'local'; //use localhost if environment not specified
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

// GET for information on a single company
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
	)
});

router.post("/api/signin",function(req,res){
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

router.post("/api/signup",function(req,res) {
	bcrypt.genSalt(saltRounds, function(err, salt) {
		bcrypt.hash(req.body['password'], salt, function(err, hash) {
			global.connection.query('SELECT * FROM MAVS_sp20.UserProfiles WHERE Email = ?', [req.body.email], function (error, results) {
				if (error) throw error;
				if (results.length > 0) {
					res.send(JSON.stringify({"status": 200, "error": null, "response": "Already Exists"}));
				} else {
					global.connection.query('INSERT INTO MAVS_sp20.UserProfiles(Email, FirstName, LastName, GradYear, Major, `Password`) ' +
						'VALUES (?, ?, ?, ?, ?, ?);', [req.body['email'], req.body['firstname'], req.body['lastname'], parseInt(req.body['gradyear']), req.body['major'], hash], function (error) {
						if (error) throw error;
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
