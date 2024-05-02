var express = require('express');
const { Pool } = require('pg');

var AuthManager = require('./public/src/utils/GithubAuth.js');
var app = express();

app.use(express.static(__dirname + '/public'));

// endpoint to render the landing page
app.get('/', (req, res) => {
  res.sendFile(__dirname +  '/public/landing.html');
});

var server = app.listen(process.env.PORT || 5000);
/*var server = app.listen(process.env.PORT || 5000, function() {
  var port = server.address().port;
  var url = `http://localhost:${port}`;
  console.log(`App now running on url http://localhost:${port}`);
});*/

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432, 
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect();

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

