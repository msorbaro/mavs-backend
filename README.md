## MAVS Backend

### How to run: `nodemon api.js`
This will start the backend. In order to actually have access to the data,
you will need to be connected to the sunapee server using Dartmouth's
VPN.

If this does not work, make sure you have reinstalled the node moduels 

update npm: `npm install -g npm`
update node modules: `npm update`

Runs the server using `yarn start` in the development mode.<br />
Open [https://localhost:3001](https://localhost:3001) to view it in the browser.
You may need to run `yarn` first.

You will also see any lint errors in the terminal.

Make sure you run the backend before starting the frontend.
To run the frontend, enter the front end directory, and
run `yarn` to update dependencies if needed, then
run `yarn start` to begin.
Open [http://localhost:8080](https://localhost:8080) to view the website.

## API calls
* GET for basic information on a single company
   * /api/companies/:name/info
     * name = company name
 
* GET for list of all companies
   * /api/companies
 
* GET for location/term info on all positions in a company
   * /api/companies/:name/positions
     * name = company name
 
* GET for term/location info for a specific position in a company
   * /api/companies/:name/:title/info
     * name = company name, title = position title
 
* GET for all relevant info for every review on a position within a company
   * /api/companies/:name/:title/reviews
     * name = company name, title = position title
 
* GET to view information within a user's profile
   * /api/users/:name
     * name = user's email
 
* GET for all reviews for a company
   * /api/companies/:name/reviews
     * name = company name
 
* GET for all reviews by a particular user
   * /api/users/:name/reviews
     * name = user's email
 
* PATCH to update desired info in a user profile
   * /api/users/:name
     * name = user's email
 
* PATCH to update a review by ReviewID
   * /api/reviews/:id
     * id = ReviewID of review to be deleted
 
* PUT to verify a user's email and password
   * /api/signin
 
* POST to add a new user to the system
   * /api/signup
 
* POST to add a new company to the system
   * /api/companies
 
* POST to write a new review
   * /api/review
 
* DELETE to remove a review by ReviewID
   * /api/reviews/:id
     * id = ReviewID of review to be deleted


