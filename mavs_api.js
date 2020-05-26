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
var cors = require('cors');
var env = process.argv[2] || 'sunapee'; //use localhost if environment not specified
var config = require('./mavs_config')[env]; //read credentials from config.js
app.use(cors());

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


// GET for basic information on a single company
// name = company name
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
	global.connection.query('select c.CompanyName, c.CompanySize, c.CompanyField ' +
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
	global.connection.query('select p.PositionTitle, r.ReviewDate, t.Term, t.Year, l.City, l.State, r.Rating, r.InterviewDifficulty, r.Comment, r.Anonymous, '+
	'u.FirstName, u.LastName, u.GradYear, u.Major '+
	'from MAVS_sp20.Reviews r '+
	'left join MAVS_sp20.Positions p on r.PositionID = p.PositionID '+
	'left join MAVS_sp20.Companies c on p.CompanyID = c.CompanyID '+
	'left join MAVS_sp20.UserProfiles u on r.PersonID = u.PersonID '+
	'left join MAVS_sp20.Terms t on r.TermID = t.TermID '+
	'left join MAVS_sp20.Locations l on l.LocationID = r.LocationID '+
	'where p.PositionTitle like ? and c.CompanyName like ?;',
		[req.params.title, req.params.name], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});


// GET to view all reviews for all companies
router.get("/api/companies/reviews",function(req,res1) {
	//Get hashed password and privileges
	global.connection.query('SELECT r.ReviewID, p.PositionTitle, c.CompanyName, r.ReviewDate, t.Term, t.Year, r.Rating, r.Comment, r.Anonymous, '+
		'u.FirstName, u.LastName, u.GradYear, u.Major, r.InterviewDifficulty, l.City, l.State '+
		'from MAVS_sp20.Reviews r '+
		'left join MAVS_sp20.Positions p on r.PositionID = p.PositionID '+
		'left join MAVS_sp20.Companies c on p.CompanyID = c.CompanyID '+
		'left join MAVS_sp20.UserProfiles u on r.PersonID = u.PersonID '+
		'left join MAVS_sp20.Locations l on l.LocationID = r.LocationID '+
		'left join MAVS_sp20.Terms t on r.TermID = t.TermID; ',
		[req.params.name], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});

router.post("/api/companies",function(req,res){
		global.connection.query('INSERT INTO MAVS_sp20.Companies ( CompanyName, CompanySize, CompanyField ) VALUES (?, ?, ?) ', [req.body.name, req.body.size, req.body.field],
		function (error, results, fields) {
				if (error) throw error;
						res.send(JSON.stringify({"status": 200, "error": null, "response": "Added"}));
				});
	})


// GET to view information within a user's profile
router.get("/api/users/:name",function(req,res1) {
	//Get hashed password and privileges
	global.connection.query('select Email, FirstName, LastName, GradYear, Major '+
		'from MAVS_sp20.UserProfiles '+
		'where Email like ?;',
		[req.params.name], function (err, res2) {
			if (err) console.log("error");
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


//POST to write a new review
router.post("/api/review",function(req,res1) {
	var full_response = [];
	global.connection.query('SELECT PersonID FROM MAVS_sp20.UserProfiles WHERE Email = ?;',
		[req.body["Email"]], function (err, res2) {
			if (err) console.log("error getting personid");
			full_response.push(res2);
			if (res2.length > 0) {
				var personid = res2[0]["PersonID"];
				global.connection.query('CALL new_comp(?);',
					[req.body["CompanyName"]], function (err, res3) {
						if (err) console.log("error running new_comp procedure");
						full_response.push(res3);
					});
				global.connection.query('SELECT CompanyID FROM MAVS_sp20.Companies WHERE CompanyName = ?;',
					[req.body["CompanyName"]], function (err, res4) {
						if (err) console.log("error getting compid");
						full_response.push(res4);
						if (res4.length > 0) {
							var compid = res4[0]["CompanyID"];
							global.connection.query('CALL new_pos(?, ?);',
								[req.body["PositionTitle"], compid], function (err, res5) {
									if (err) console.log("error running new_pos procedure");
									full_response.push(res5);
								});
							global.connection.query('SELECT PositionID FROM MAVS_sp20.Positions WHERE PositionTitle like ? and CompanyID = ?',
								[req.body["PositionTitle"], compid], function (err, res6) {
									if (err) console.log("error getting posid");
									full_response.push(res6);
									if (res6.length > 0) {
										var posid = res6[0]["PositionID"];
										global.connection.query('INSERT INTO MAVS_sp20.Locations (City, State) Value (?, ?);',
											[req.body["City"], req.body["State"]], function (err, res7) {
												if (err) console.log("error creating new location");
												full_response.push(res7);
											});
										global.connection.query('SELECT LocationID FROM MAVS_sp20.Locations WHERE City like ? and State like ? LIMIT 1;',
											[req.body["City"], req.body["State"]], function (err, res8) {
												if (err) console.log("error getting locid");
												full_response.push(res8);
												if (res8.length > 0) {
													var locid = res8[0]["LocationID"];
													global.connection.query('INSERT INTO MAVS_sp20.LocatedAt (PositionID, LocationID) VALUES (?, ?);',
														[posid, locid], function (err, res9) {
															if (err) console.log("error updating located at");
															full_response.push(res9);
														});
													global.connection.query('INSERT INTO MAVS_sp20.Terms (Term, `Year`) Value (?, ?);',
														[req.body["Term"], req.body["Year"]], function (err, res10) {
															if (err) console.log("error creating new term");
															full_response.push(res10);
														});
													global.connection.query('SELECT TermID FROM MAVS_sp20.Terms WHERE Term like ? and `Year` like ? LIMIT 1;',
														[req.body["Term"], req.body["Year"]], function (err, res11) {
															if (err) console.log("error getting termid");
															full_response.push(res11);
															if (res11.length > 0) {
																var termid = res11[0]["TermID"];
																global.connection.query('INSERT INTO MAVS_sp20.OfferedTerms (PositionID, TermID) VALUE (?, ?);',
																	[posid, termid], function (err, res12) {
																		if (err) console.log("error updating offered terms");
																		full_response.push(res12);
																	});
																global.connection.query('INSERT INTO MAVS_sp20.Reviews (PositionID, Rating, Comment, PersonID, Anonymous, TermID, LocationID, InterviewDifficulty) ' +
																	'VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
																	[posid, parseInt(req.body["Rating"]), req.body["Comment"], personid, parseInt(req.body["Anonymous"]), termid, locid, parseInt(req.body["InterviewDifficulty"])], function (err, res13) {
																		if (err) console.log("error writing the review");
																		full_response.push(res13);
																		//res1.send(res13);
																	});
																res1.send(JSON.stringify({"status": 200, "error": null, "response": full_response}));
															}
														});
												}
											});
									}
								});
						}
					});
			}
		});
	console.log("Response logged\n")
});


// GET for all the review for a company
// name = Company Name
router.get("/api/companies/:name/reviews",function(req,res1) {
	global.connection.query('select r.ReviewID, p.PositionTitle, c.CompanyName, r.ReviewDate, t.Term, t.Year, l.City, l.State, r.Rating, r.InterviewDifficulty, r.Comment, r.Anonymous, '+
		'u.FirstName, u.LastName, u.GradYear, u.Major '+
		'from MAVS_sp20.Reviews r '+
		'left join MAVS_sp20.Positions p on r.PositionID = p.PositionID '+
		'left join MAVS_sp20.Companies c on p.CompanyID = c.CompanyID '+
		'left join MAVS_sp20.UserProfiles u on r.PersonID = u.PersonID '+
		'left join MAVS_sp20.Terms t on r.TermID = t.TermID '+
		'left join MAVS_sp20.Locations l on r.LocationID = l.LocationID '+
		'where c.CompanyName like ?;',
		[req.params.name], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});


// GET for all the review for a user
// name = user's email
router.get("/api/users/:name/reviews",function(req,res1) {
	//Get hashed password and privileges
	global.connection.query('SELECT r.ReviewID, p.PositionTitle, c.CompanyName, r.ReviewDate, t.Term, t.Year, l.City, l.State, r.Rating, r.InterviewDifficulty, r.Comment, r.Anonymous, '+
		'u.FirstName, u.LastName, u.GradYear, u.Major '+
		'from MAVS_sp20.Reviews r '+
		'left join MAVS_sp20.Positions p on r.PositionID = p.PositionID '+
		'left join MAVS_sp20.Companies c on p.CompanyID = c.CompanyID '+
		'left join MAVS_sp20.UserProfiles u on r.PersonID = u.PersonID '+
		'left join MAVS_sp20.Terms t on r.TermID = t.TermID '+
		'left join MAVS_sp20.Locations l on l.LocationID = r.LocationID '+
		'where u.Email like ?;',
		[req.params.name], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});


// DELETE a review by ReviewID
router.delete("/api/reviews/:id",function(req,res1) {
	//Get hashed password and privileges
	global.connection.query('DELETE FROM MAVS_sp20.Reviews WHERE ReviewID = ?;',
		[req.params.id], function (err, res2) {
			if (err) console.log("error");
			res1.send(JSON.stringify({"status": 200, "error": null, "response": res2}));
		}
	)
});


//PATCH for updating a review by ReviewID
router.patch("/api/reviews/:id", function(req, res1) {
	var return_results = [];
	// Only update attributes that changed
	for (var col in req.body) {
		global.connection.query('UPDATE MAVS_sp20.Reviews SET ?? = ? WHERE ReviewID = ?;',
				[col, req.body[col], req.params.id], function (error, results) {
					if (error) res1.send(JSON.stringify({
						"status": 500,
						"error": "SQL Error",
						"response": "Something is likely wrong with your inputs"
					}));
					return_results.push(results);
				});
		}
	res1.send(JSON.stringify({"status": 200, "error": null, "response": return_results}));
});


// start server running on port 3000 (or whatever is set in env)
app.use(express.static(__dirname + '/'));
app.use("/",router);
app.set( 'port', ( process.env.PORT || config.port || 3000 ));

app.listen(app.get( 'port' ), function() {
	console.log( 'Node server is running on port ' + app.get( 'port' ));
	console.log( 'Environment is ' + env);
});
