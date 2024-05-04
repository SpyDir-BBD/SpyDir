
const ConnectDB = require('./src_db/db_conn');
var express = require('express');
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

var server = app.listen(process.env.PORT || 5000, function() {
  var port = server.address().port;
  var url = `http://localhost:${port}`;
  console.log(`App now running on url http://localhost:${port}`);
});

//var server = app.listen(5000);

const pool = new ConnectDB(process.env.DB_USER, process.env.DB_HOST, process.env.DB_NAME, process.env.DB_PASSWORD);
pool.connect();

app.get('/themes', (req, res) => {
  pool.getThemes( (error, response) => {
    if (error) {
      console.log(error);
      res.status(404).header('Content-Type', 'application/json').send(JSON.stringify(error));
    }
    console.log(response.rows);
    res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response.rows));
  });
});

app.get('/filetypes', (req, res) => {
  pool.getThemes( (error, response) => {
    if (error) {
      console.log(error);
      res.status(404).header('Content-Type', 'application/json').send(JSON.stringify(error));
    }
    console.log(response.rows);
    res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response.rows));
  });
});

app.get('/history', (req, res) => {
  pool.getHistory( (error, response) => {
    if (error) {
      console.log(error);
      res.status(404).header('Content-Type', 'application/json').send(JSON.stringify(error));
    }
    console.log(response.rows);
    res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response.rows));
  });
});


app.post('/user', (req, res) => {

  username = req.body.username;
  theme_id = req.body.theme_id;
  if (username && theme_id) {
    pool.addUser(username, theme_id, (error, response) => {
      if (error) {
        console.log(error);
      }
      console.log(response.rows);
      //res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response));
    });
  }
});
