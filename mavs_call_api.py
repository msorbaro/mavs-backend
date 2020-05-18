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

def get_company():
	print("Company: ")
	company = input()

	# Make call
	print ("\nMaking a get call to "+company)
	call_url = 'https://localhost:3000/api/companies/' + company
	make_get_call(call_url)

def put_sign_in():
	print("Email: ")
	email = input()
	print("Password: ")
	password = input()
	# Make call
	print ("\nSigning in...")
	call_url = 'https://localhost:3000/api/signin'
	data = {'email': email, 'password': password}
	make_put_call(call_url, data=data)

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
	call_url = 'https://localhost:3000/api/signup'
	data = {'email':email, 'password':password, 'firstname':firstname, 'lastname':lastname, 'gradyear':gradyear, 'major':major}
	make_post_call(call_url, data)

if __name__ == '__main__':
	#get_company()
	put_sign_in()
	#post_sign_up()