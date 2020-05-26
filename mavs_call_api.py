import requests

'''
Client side demo to fetch data from a RESTful API.  Assumes Node.js file api is running (nodemon api.js <localhost|sunapee>)
on the server side.
Authors: Tim Pierson, Dartmouth CS61, Spring 2020 (framework)
		Summer Christensen, Dartmouth CS61, Spring 2020
Requires installation of mysql connector: pip install mysql-connector-python
	also requires Requests: pip install requests
Based on: https://dev.mysql.com/doc/connector-python/en/connector-python-example-connecting.html

Usage: python call_api.py
'''

def make_get_call(url):
	#make get call to url
	resp = requests.get(url)
	#expecting to get a status of 200 on success
	if resp.json()['status'] != 200:
		# This means something went wrong.
		print('Error ' + str(resp.json()['status']) + " - " + resp.json()['error'])
		print(resp.json()['response'])
		exit()

	#print data returned
	print ("get succeeded")
	print(resp.json()['response'])

def make_put_call(url, data={}):
	#make get call to url
	resp = requests.put(url, data)
	#expecting to get a status of 200 on success
	if resp.json()['status'] != 200:
		# This means something went wrong.
		print('Error ' + str(resp.json()['status']) + " - " + resp.json()['error'])
		print(resp.json()['response'])
		exit()

	#print data returned
	print ("put succeeded")
	print(resp.json()['response'])

def make_post_call(url, data={}):
	#make get call to url
	resp = requests.post(url, data)
	#expecting to get a status of 200 on success
	if resp.json()['status'] != 200:
		# This means something went wrong.
		print('Error ' + str(resp.json()['status']) + " - " + resp.json()['error'])
		print(resp.json()['response'])
		exit()

	#print data returned
	print ("post succeeded")
	print(resp.json()['response'])

def make_patch_call(url, data={}):
	#make get call to url
	resp = requests.patch(url, data)
	#expecting to get a status of 200 on success
	if resp.json()['status'] != 200:
		# This means something went wrong.
		print('Error ' + str(resp.json()['status']) + " - " + resp.json()['error'])
		print(resp.json()['response'])
		exit()

	#print data returned
	print ("patch succeeded")
	print(resp.json()['response'])

def make_delete_call(url):
	#make get call to url
	resp = requests.delete(url)
	#expecting to get a status of 200 on success
	if resp.json()['status'] != 200:
		# This means something went wrong.
		print('Error ' + str(resp.json()['status']) + " - " + resp.json()['error'])
		print(resp.json()['response'])
		exit()

	#print data returned
	print ("delete succeeded")
	print(resp.json()['response'])

# GET for basic information on a single company
def get_company_info():
	print("Company: ")
	company = input()
	# Make call
	print ("\nMaking a get call to "+company)
	call_url = 'http://localhost:3000/api/companies/' + company +'/info'
	make_get_call(call_url)

# GET for location/term info on all positions in a company
def get_company_positions():
	print("Company: ")
	company = input()
	# Make call
	print("\nMaking a get call to " + company + " about positions")
	call_url = 'http://localhost:3000/api/companies/' + company + '/positions'
	make_get_call(call_url)

# GET for term/location info for a specific position in a company
def get_position_info():
	print("Position: ")
	position = input()
	print("Company: ")
	company = input()
	# Make call
	print("\nMaking a get call to " + position + " @ " + company)
	call_url = 'http://localhost:3000/api/companies/' + company + "/" + position + "/info"
	make_get_call(call_url)

# GET for all relevant info for every review on a position within a company
def get_position_reviews():
	print("Position: ")
	position = input()
	print("Company: ")
	company = input()
	# Make call
	print("\nMaking a get call to " + position + " @ " + company)
	call_url = 'http://localhost:3000/api/companies/' + company + "/" + position + "/reviews"
	make_get_call(call_url)

# PATCH to update desired info in a user profile
def patch_user_info():
	print("Email of account to update: ")
	email = input()
	print("New first name: ")
	fname = input()
	print("New last name: ")
	lname = input()
	print("New password: ")
	password = input()
	print("New major: ")
	major = input()
	print("New grad year: ")
	year = input()
	data = {'FirstName':fname, 'LastName':lname, 'Password':password, 'Major':major, 'GradYear':year}
	senddata = {}
	for key in data.keys():
		if data[key] != '':
			senddata[key] = data[key]
	print("\nMaking a patch call for " + email)
	call_url = 'http://localhost:3000/api/users/' + email
	make_patch_call(call_url, senddata)


# PUT to verify a user's email and password
def put_sign_in():
	print("Email: ")
	email = input()
	print("Password: ")
	password = input()
	# Make call
	print ("\nSigning in...")
	call_url = 'http://localhost:3000/api/signin'
	data = {'email': email, 'password': password}
	make_put_call(call_url, data=data)


# POST to add a new user to the system
def post_sign_up():
	print("Email: ")
	email = input()
	print("Password: ")
	password = input()
	print("FirstName: ")
	firstname = input()
	print("LastName: ")
	lastname = input()
	print("GradYear: ")
	gradyear = input()
	print("major: ")
	major = input()
	# Make call
	print ("\nSigning up...")
	call_url = 'http://localhost:3000/api/signup'
	data = {'email':email, 'password':password, 'firstname':firstname, 'lastname':lastname, 'gradyear':gradyear, 'major':major}
	make_post_call(call_url, data)

def get_all_companies():
	print("\nMaking a get call for all companies")
	call_url = 'http://localhost:3000/api/companies'
	make_get_call(call_url)

def get_user_info():
	print("Email: ")
	email = input()
	# Make call
	print("\nMaking a get call to " + email)
	call_url = 'http://localhost:3000/api/users/' + email
	make_get_call(call_url)

def fail_call_test():
	print("\nMaking a test post call")
	call_url = 'http://localhost:3000/api/test'
	make_post_call(call_url)

def post_new_review():
	print("\nMaking a post call for a new review")
	call_url = 'http://localhost:3000/api/review'
	data = {'Email':'test@dartmouth.edu', 'PositionTitle':'Blacksmith', 'CompanyName':'Medieval Times', 'Term':'W', 'Year':2020, 'City':'London', 'State':'GB', 'Rating':10, 'Comment':'Debugging', 'Anonymous':1, 'InterviewDifficulty':1}
	make_post_call(call_url, data)

def get_company_reviews():
	print("Company: ")
	company = input()
	print("\nMaking a get call for a company's reviews")
	call_url = 'http://localhost:3000/api/companies/' + company + '/reviews'
	make_get_call(call_url)

def get_user_reviews():
	print("Email: ")
	email = input()
	print("\nMaking a get call for a company's reviews")
	call_url = 'http://localhost:3000/api/users/' + email + '/reviews'
	make_get_call(call_url)

def delete_review():
	print("ReviewID: ")
	review = input()
	print("\nMaking a delete call for a review")
	call_url = 'http://localhost:3000/api/reviews/' + review
	make_delete_call(call_url)

def patch_review():
	print("ReviewID: ")
	review = input()
	print("New Rating: ")
	rating = input()
	print("New Interview Difficulty: ")
	intdiff = input()
	print("New Comment: ")
	comment = input()
	data = {'Rating':rating, 'InterviewDifficulty':intdiff, 'Comment':comment}
	usable_data = {}
	for key in data.keys():
		if data[key] != '':
			usable_data[key] = data[key]
	print("\nMaking a patch call for a review")
	call_url = 'http://localhost:3000/api/reviews/' + review
	make_patch_call(call_url, usable_data)

if __name__ == '__main__':
	print("Call to test: ")
	call = int(input())
	while call != 0:
		if call == 1:
			get_company_info()  # 1
		elif call == 2:
			get_company_positions()  # 2
		elif call == 3:
			get_position_info()  # 3
		elif call == 4:
			get_position_reviews()  # 4
		elif call == 5:
			patch_user_info()  # 5
		elif call == 6:
			put_sign_in()  # 6
		elif call == 7:
			post_sign_up()  # 7
		elif call == 8:
			get_all_companies()
		elif call == 9:
			get_user_info()
		elif call == 10:
			fail_call_test()
		elif call == 11:
			post_new_review()
		elif call == 12:
			get_company_reviews()
		elif call == 13:
			get_user_reviews()
		elif call == 14:
			delete_review()
		elif call == 15:
			patch_review()
		print("\nCall to test: ")
		call = int(input())
	exit()
