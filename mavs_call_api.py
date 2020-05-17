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

def handle_select():
	print("Company: ")
	company = input()

	# Make call
	print ("\nMaking a get call to "+company)
	call_url = 'http://localhost:3000/api/companies/' + company
	make_get_call(call_url)

if __name__ == '__main__':
	handle_select()

