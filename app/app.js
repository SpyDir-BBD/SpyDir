
const ConnectDB = require('./src_db/db_conn');
var express = require('express');
var app = express();
var cors = require('cors');

let globalAccessToken = ''; // global access token

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/public'));

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
    const githubResponse = await fetch(githubUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const githubData = await githubResponse.text();
    const access_token = githubData.split('access_token=')[1].split('&scope')[0];
    console.log("===========================");
    //console.log("access_token = " + access_token);
    globalAccessToken = access_token;
    console.log("access_token = " + globalAccessToken);
    console.log("===========================");
    // Send the GitHub API response back to the client
    res.status(200).send(githubData);
  } 
  catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

var server = app.listen(process.env.PORT || 5000, function() {
  var port = server.address().port;
  var url = `http://localhost:${port}`;
  console.log(`App now running on url http://localhost:${port}`);
});

//var server = app.listen(5000);
// db connection and db endpoints

const pool = new ConnectDB(process.env.DB_USER, process.env.DB_HOST, process.env.DB_NAME, process.env.DB_PASSWORD);
pool.connect();

app.post('/api/user', async (req, res) => {
  // brearer has 7 characters
  const requestAccessToken = req.headers.authorization.substring(7, req.headers.authorization.length);
  console.log("access_token = " + requestAccessToken);
  if (requestAccessToken !== globalAccessToken) {
    res.status(403).send(JSON.stringify({ 'error': 'Access token is not valid.' })); // status code 403 = forbidden -> server refuses to authorize user
  }
  else {
    //console.log( await JSON.parse(req.body));
    req.body = JSON.parse(req.body);
    var username = await req.body["username"];
    var theme_id = await req.body["theme_id"];

    if (await pool.checkUserExists(username, async (error, response) => {
      //console.log(response);
      //console.log(await response.rows[0]["user_count"]);
      if (response.rows[0]["user_count"]==1) {
        await pool.getUserByUsername(username, async (error, response) => {
          var data = {
            "message" : "User already exists in database",
            "user_details" : response.rows[0]
          };
          console.log(data);
          res.status(208).header('Content-Type', 'application/json').send(JSON.stringify(data)); // status code 409 is used if resource already exists
        });
      }
      else {
        pool.addUser(username, theme_id, (error, response) => {
          if (error) {
            console.log(error);
            res.status(500).header('Content-Type', 'application/json').send(JSON.stringify({"message" : error})); // status code 500 = internal server error
          }
          else {
            console.log(response.rows);
            var data = {
              "message" : "User already exists in database",
              "user_details" : response.rows[0]
            };
            res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(data));
          }
        });
      }
    }));
  }
});

app.get('/api/themes', (req, res) => {
  pool.getThemes( (error, response) => {
    if (error) {
      console.log(error);
      res.status(404).header('Content-Type', 'application/json').send(JSON.stringify(error));
    }
    console.log(response.rows);
    res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response.rows));
  });
});

app.get('/api/filetypes', (req, res) => {
  pool.getFileTypes( (error, response) => {
    if (error) {
      console.log(error);
      res.status(404).header('Content-Type', 'application/json').send(JSON.stringify(error));
    }
    console.log(response.rows);
    res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response.rows));
  });
});

// access token is not required to view history
app.get('/api/history', (req, res) => {
  pool.getHistory( (error, response) => {
    if (error) {
      console.log(error);
      res.status(404).header('Content-Type', 'application/json').send(JSON.stringify(error));
    }
    console.log(response.rows);
    res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response.rows));
  });
});
