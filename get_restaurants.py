import mysql.connector
from mysql.connector import errorcode
import json
import sys

'''
Demo to show that we can connect directly to a database via python.  Fetches data about a single restaurant
from the database, *without* a call to an API.
Author: Tim Pierson, Dartmouth CS61, Spring 2020
Requires installation of mysql connector: sudo pip install mysql-connector-python
Based on: https://dev.mysql.com/doc/connector-python/en/connector-python-example-connecting.html

Usage: python get_restaurants.py restaurant_name <localhost|sunapee>
	restaurant_name is the name of the restaurant about which to fetch data
	localhost (default if not supplied) to connect to MySQL on localhost
	sunapee to connect to MariaDB on computer science server sunapee
	Example: python get_restaurants.py 'rosa mexicano' sunapee


NOTE: must be VPN'd into Dartmouth to access sunapee.cs.dartmouth.edu
NOTE: accesses database with credentials provided in db.json. Make sure to 
	  edit db.json with your user name and password to make the connection
'''


credentials_filename = "db.json" #file holding username and pasword to database

def read_database_credentials(credentials_filename):
	#Read credentials from config file specified by credentials_filename
	#Input: name of file holding credentials
	#Output: dictionary of credentials with entries for username, password, host, and database
	#		 exit if file not found or database name is invalid

	#read credentials file
	credentials_file = open(credentials_filename,'r')
	credentials = json.load(credentials_file)
	credentials_file.close()

	#get database as second command list parameter (use localhost if not provided)
	if len(sys.argv) == 3:
		#expect sunapee or localhost, make sure this parameter is one of those
		if sys.argv[2] not in (server for server in credentials):
			print "Invalid database specified"
			exit()
		#set credentials to database specified
		credentials = credentials[sys.argv[2]] 
	else:
		#database not provided, use localhost as default
		credentials = credentials["localhost"]

	return credentials

def get_database_connection(credentials):
	#Get a connection to database
	#Input: dictionary with username, password, host, and database
	#Output: database connection or exit if connection not successful

	try:
		#make connection to database on host server using credentials provided
		cnx = mysql.connector.connect(user=credentials["user"], password=credentials["password"], 
									host=credentials["host"], database=credentials["database"])
		return cnx
	#catch exceptions, alert user to problem, then exit
	except mysql.connector.Error as err:
		if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
			print("Something is wrong with your user name or password")
		elif err.errno == errorcode.ER_BAD_DB_ERROR:
			print("Database does not exist")
		else:
			print(err)
		cnx.close()
		exit()

def get_restaurant_data(cnx, restaurant_name):
	#Query the database
	#Input: 
	#	cnx: connection to database
	#	restaurant_name: name of restaurant to fetch from database
	#Output: results of query printed to screen

	#Reference: https://pynative.com/python-mysql-execute-parameterized-query-using-prepared-statement/

	#get cursor from database connection and execute query using parameterized query and prepared statement
	cursor = cnx.cursor()
	query = ("SELECT RestaurantID, RestaurantName, Boro, CuisineDescription "
			+"FROM Restaurants r JOIN Cuisine c USING (CuisineID) "
			+"WHERE RestaurantName LIKE %s")  #%s is a parameter
	cursor.execute(query, ('%'+restaurant_name+'%',)) #second item must be tuple, one entry per parameter

	#get column names
	cols = cursor.description #column names plus other attributes stored in description, one tuple per column
	column_names = [] #store column names in this list
	for c in cols: #loop over all columns
		column_names.append(c[0]) #column name is first item in tuple, extract it and append to column_names list

	#print rows, each row is a tuple of attributes
	#could do for (a1, a2, ... an) in cursor where ax = attribute number x
	#can only loop over cursor once! (cannot back up) -- it is an iterator
	for row in cursor:
	  for i in range(len(column_names)):
	  	print column_names[i]+":"+unicode(row[i])
	  print

	#close cursor
	cursor.close()



	


if __name__ == '__main__':
	#check usage
	if len(sys.argv) < 2 or len(sys.argv) > 3:
		print "Usage: python get_restaurants.py restaurant_name <localhost|sunapee> "

	#read database credentials from file
	print "Reading database credentials from",credentials_filename
	credentials = read_database_credentials(credentials_filename)
	print "\tDone"

	#get connection to database
	print "Connecting to database",credentials["database"],"on",credentials["host"]
	cnx = get_database_connection(credentials)
	print "\tDone, got good connection" #would exit in get_database_connection if not successful
	
	#query database for restaurant data
	restaurant = sys.argv[1]
	print "\nFetching data about",restaurant
	get_restaurant_data(cnx,restaurant)

	#close connection to database and exit
	cnx.close()