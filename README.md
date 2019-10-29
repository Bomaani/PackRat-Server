# Brock-PackRat-Server

PackRat app project completed as a single solo project by Brock Boutwell [EI34]

## Technologies

Html, CSS, Javascript, Express, React, Node, Postgresql

## link to WireFrames 
* https://thinkful-ei-gecko.github.io/Brock-Capstone-1-Wireframes/Wireframes/landingPage.html

## link to Live App 
* https://packrat-app.brockboutwell.now.sh

## link to Client Github Repo 
* https://github.com/Bomaani/PackRat-Client-React

## link to Server Github Repo 
* https://github.com/Bomaani/PackRat-Server

# User Stories

![Packrat Landing Page](/images/screenshot1.png "PackRat")

### Example User with populated account data

* Username: dunder
* Password: password

## API Endpoints

### Allows login and verification
* /auth/login

### Allows Post for registration
* /users

### Allows users to Get/Post collections based on user id
* /collections

### Allows user to Get/Post items
* /items

### Allows user to Get/Patch/Delete items
* /:item_id

### Allows user to Get items in a collection
* /:collection_id/items

### Allows user to Delete a collection
* /:collection_id

### Allows users to Patch items
* /items/:item_id
  
### As a user with no mouse I should be able to:
*  navigate the website with a keyboard with no issue.

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.