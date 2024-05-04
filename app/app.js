var express = require('express');
const { Pool } = require('pg');
var app = express();
var cors = require('cors');

app.use(express.static(__dirname + '/public'));

// const corsOption = {
//   origin: true
// };

// app.use(cors(corsOption));

// app.options('*', cors());

// endpoint to render the landing page
app.get('/', (req, res) => {

  res.sendFile(__dirname +  '/public/landing.html');
});

app.get('/github-data', async (req, res) => {
  try {
      console.log('hit');
      const { clientId, clientSecret, code, redirectUri } = req.query;
      
      // Make a request to GitHub API
      const githubUrl = `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`;
      const githubResponse = await fetch(githubUrl, {headers: {
        'Content-Type': 'application/json'
    }});
      const githubData = await githubResponse.text();
      console.log(githubData);
      // Send the GitHub API response back to the client
      res.send(githubData);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
});

//var server = app.listen(process.env.PORT || 5000);
var server = app.listen(process.env.PORT || 5000, function() {
  var port = server.address().port;
  var url = `http://localhost:${port}`;
  console.log(`App now running on url http://localhost:${port}`);
});

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: 5432, 
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// pool.connect();

// Create a JSON user object
//const user = {
//  username: 'John Doe',
//  email: 'johndoe@gmail.com'
//};
//
//pool.query('INSERT INTO Users (UserName, Email, DateCreated) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *', [user.username, user.email], (err, result) => {
//  if (err) {
//    console.error('Error inserting user:', err);
//    return;
//  }
//  
//  console.log('User inserted successfully:', result.rows[0]);
//});

// - Store new user
// - Get / Set zip user history
// - Get Themes