var config = {
sunapee: {
	database: {
		host     : 'sunapee.cs.dartmouth.edu',
		user     : 'MAVS_sp20', //'your sunapee username here'
		password : '!5rVZaYk', //'your sunapee password here'
		schema : 'MAVS_sp20' //'your sunapee default schema'
	},
	port: 3306
},
local: {
	database: {
		host     : 'localhost',
		user     : 'root', //'your localhost username here'
		password : 'Rose1997', //your localhost password here'
		schema : 'nyc_inspections' //'your localhost default schema here'
	},
	port: 3000
}
};
module.exports = config;
