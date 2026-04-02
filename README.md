# Assignment Four
## Purpose
The purpose of this assignment is to leverage Google’s analytics policies to gather information about the requests being sent in by users.

Using the information already entered to MongoDB for the previous assignment, you will add another collection of reviews that are tied to the movies. This way users can query the database and get the previous information (title, year released and actors) as well as the reviews. These two entities should remain separate! Do not append the reviews to the existing movie information.  

Leverage the Async.js library or mongo $lookup aggregation capability to join the entities.


## Requirements
- Create a collection in MongoDB (Mongo Atlas) to hold reviews about existing movies.
    - A review contains the name of the reviewer, a small quote about what they thought about the movie, and their rating out of five stars.
        - movieId (from the movie collection)
        - username
        - review
        - rating
    - The review collection should have at least one review for each movie. – The review can be a simple, ficticious review that you create.
- This API should build upon the previous API in assignment three.
    - If the user sends a response with the query parameter reviews=true, then the response should include the movie information as well as all the reviews for the movie. If they do not pass this in, the response should not show the reviews. – The review information should be appended to the response to the user.
        - Hint: Look at $lookup on how to aggregate two collections
    - Implement GET/POST (DELETE is optional for reviews)
        - POST needs to be secured with a JWT authorization token.  The Username in the token should be stored with the review (indicating the user that submitted the review)
            - If review created send back JSON message { message: 'Review created!' } 
- Extra Credit:  Add custom analytics to return information about which movies users are querying.
    - Create a custom analytics policy that describes the number of times each movie has been reviewed. To do this, you will have to send a number of requests for each movie.
        - Custom Dimension: Movie Name
        - Custom Metric: Requested:  Value 1 (it will aggregate)
    - Custom Dimension and Metric should be sent with an Event type 
        - Event Category: Genre of Movie (e.g. Western)
        - Event Action: Url Path (e.g. post /reviews)
        - Event Label: API Request for Movie Review
        - Event Value: 1 


## Submissions
- Create a Postman test to test your API. You should include the following requests.
    - All tests from HW3 and
    - Valid request without the review query parameter (e.g reviews=true on the /movies route)
    - Invalid request (for a movie not in the database) without the review query parameter. 
    - Valid request with the review query parameter. (e.g reviews=true on the /movies/:id route)
    - Valid save review method that associates a review with a movie (save a review for a movie in your DB)
    - Invalid save review (movie missing from DB)
    - Export a report from Google Analytics (only if you do the Extra Credit)

- Create a readme.md at the root of your github repository with the embedded (markdown) to your test collection
    - Within the collection click the (…), share collection -> Embed
    - Static Button
    - Click update link
    - Include your environment settings
    - Copy to clipboard 
- Submit the Url to canvas with the REPO CSC_3916
- Note: All tests should be testing against your Heroku or Render endpoint

## Rubic
- This one has an extra credit – code the custom analytics that correctly sends the movie name and they attach a PDF or Excel report from Google Analytics you receive +4
- -2 if missing reviews collection
- -2 if missing query parameters ?reviews=true that returns reviews (should include both movie and reviews)
- -1 for each test that is missing (valid request for movie with query parameter, valid save review, invalid movie request, invalid save review) – for max of (-4 for missing all tests)
- -2 if you have to manually copy the JWT token to get their tests to run (versus saving it from the sign-in call)
- Try changing the review data to enter a different review before submitting to validate new review are returned – if not (-1)

## Resources
- https://github.com/daxko/universal-ga
- https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets 
- https://cloud.google.com/appengine/docs/flexible/nodejs/integrating-with-analytics
- https://caolan.github.io/async/index.html
- https://support.google.com/analytics/answer/2709829

## Project Overview
This API manages `Movie` documents and `Review` documents stored in MongoDB (via Mongoose).

When you call `GET /movies/:id?reviews=true`, the API returns the movie plus all of its reviews using MongoDB `$lookup`.

## Installation
1. Install dependencies:
   - `npm install`

2. Create a `.env` file in the project root:
   - `DB=<your MongoDB connection string>`
   - `SECRET_KEY=<your JWT signing secret>`
   - `GA_KEY=<your Google Analytics tracking/property ID>` (optional, extra credit)
   - (optional) `UNIQUE_KEY=<if needed by your helpers>`

## Run Locally
- `node server.js` or `npm start`
- Server listens on `PORT` if set, otherwise `8080`.

## Seed sample data (movies + reviews + demo user)
If you want quick sample data for testing (three movies, one review each, and a user you can sign in with):

1. Ensure `.env` has a valid `DB` connection string.
2. Run: `npm run seed`

The script removes any previous seed rows that used the same movie titles, then inserts fresh data. It prints **movie `_id` values** (use them in `GET /movies/:id` and `POST /reviews`) and demo credentials:

- **Username:** `demo_student@example.com`
- **Password:** `DemoPass123`

You can still use your own `POST /signup` user instead.

## Deployment (Heroku or Render)

Set the same environment variables on the host as in `.env` (never commit `.env`):

| Variable | Required | Notes |
|----------|----------|--------|
| `DB` | Yes | MongoDB Atlas SRV URI; allow **Network Access** from the internet (`0.0.0.0/0` is typical for class projects). |
| `SECRET_KEY` | Yes | Same idea as local; must match what you use to issue JWTs. |
| `GA_KEY` | No | Google Analytics ID for extra credit analytics hits. |
| `PORT` | Usually automatic | Heroku/Render inject this; you normally do **not** set it manually. |

**Heroku**
1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli), log in, and create an app.
2. Connect your GitHub repo or deploy with `git push heroku main`.
3. **Settings → Config Vars:** add `DB`, `SECRET_KEY`, and optionally `GA_KEY`.
4. The included `Procfile` runs `web: node server.js`. Heroku also honors `npm start`.

**Render**
1. New **Web Service**, connect this repository.
2. **Build command:** `npm install`  
   **Start command:** `npm start` or `node server.js`
3. **Environment** tab: add `DB`, `SECRET_KEY`, and optionally `GA_KEY`.
4. Use the service **HTTPS URL** as your API base URL in Postman for submission.

After deploy, run `npm run seed` **locally** (still pointed at the same Atlas cluster) if your data lives in that cluster—your hosted API will then see the same data. Alternatively, seed by calling your deployed `POST /signup`, `POST /movies`, and `POST /reviews` with a JWT.

## Google Analytics (extra credit)
Configure a GA property and custom dimension/metric per the assignment. Set `GA_KEY` in production so `POST /reviews` can send the measurement hit. Events can take time to appear in reports.

## API Endpoints
- `POST /signup`
- `POST /signin`
- `POST /movies` (JWT required)
- `GET /movies` (JWT required)
- `GET /movies/:id` (JWT required)
  - Use `?reviews=true` to include reviews
- `GET /reviews` (JWT required)
  - Optional filter: `?movieId=<id>`
- `POST /reviews` (JWT required)
  - On success returns: `{ "message": "Review created!" }`
- `DELETE /reviews/:id` (optional)

## Postman Collection Link
Embed/share URL (paste yours here):
- `<paste your Postman collection URL here>`
