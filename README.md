## MAVS Backend

### `nodemon api.js`

If this does not work, make sure you have reinstalled the node moduels 

update npm: `npm install -g npm`
update node modules: `npm update`

Runs the server using `yarn start` in the development mode.<br />
Open [https://localhost:3001](https://localhost:3001) to view it in the browser.

You will also see any lint errors in the terminal.

Make sure you run the backend before starting the frontend.

### Current API calls
#### GET for basic information on a single company
 /api/companies/:name/info
 name = company name
#### GET for list of all companies
 /api/companies
#### GET for location/term info on all positions in a company
 /api/companies/:name/positions
 name = company name
#### GET for term/location info for a specific position in a company
 /api/companies/:name/:title/info
 name = company name, title = position title
#### GET for all relevant info for every review on a position within a company
 /api/companies/:name/:title/reviews
 name = company name, title = position title
#### GET to view information within a user's profile
 /api/users/:name
 name = user's email
#### PATCH to update desired info in a user profile
 /api/users/:name
 name = user's email
#### PUT to verify a user's email and password
 /api/signin
#### POST to add a new user to the system
 /api/signup

