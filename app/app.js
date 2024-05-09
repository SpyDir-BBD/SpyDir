
const ConnectDB = require('./src_db/db_conn');
var express = require('express');
var app = express();
var cors = require('cors');

let globalAccessToken = ''; // global access token
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = 'http://localhost:5000';

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

/*************************************** Github oauth endpoints ******************************************/

app.get('/github-login', async (req, res) => {
  data = JSON.stringify({
    "message" : "github login url",
    "url" : `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user,repo,pull_requests:write,pull_requests:read`
  });
  res.status(200).send(data);
});

app.post('/api/token', async (req, res) => {
  try {

    //req.body = JSON.parse(req.body);
    var code = req.body["authCode"];
    
    // Make a request to GitHub API
    const githubUrl = `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`;
    const githubResponse = await fetch(githubUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const githubData = await githubResponse.text();
    const access_token = githubData.split('access_token=')[1].split('&scope')[0];
    globalAccessToken = access_token;


    // send access token to client
    res.status(200).send(access_token);
  } 
  catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/*********************************** Database endpoints ********************************************/

var server = app.listen(5000);
console.log('App now running on url http://localhost:5000');

const db_cliient = new ConnectDB(process.env.DB_USER, process.env.DB_HOST, process.env.DB_NAME, process.env.DB_PASSWORD);
db_cliient.connect();

app.post('/api/user', async (req, res) => {
  // brearer has 7 characters
  const requestAccessToken = req.headers.authorization.substring(7, req.headers.authorization.length);
  //console.log("access_token = " + requestAccessToken);

  if (requestAccessToken !== globalAccessToken) {
    res.status(403).send(JSON.stringify({ 'error': 'Access token is not valid.' })); // status code 403 = forbidden -> server refuses to authorize user
  }
  else {
    //console.log( await JSON.parse(req.body));
    req.body = JSON.parse(req.body);
    var username = req.body["username"];
    var theme_id = req.body["theme_id"];

    let check;
    await db_cliient.checkUserExists(username)
    .then( (val) => {
      console.log(val);
      check = val;
    }) 
    .catch(err => console.log(err));

    if (check) {
      await db_cliient.getUserByUsername(username)
      .then( (data) => {
        console.log(data);
        res.status(208).header('Content-Type', 'application/json').send(JSON.stringify(data)); // status code 409 is used if resource already exists
      })
      .catch(err => console.log(err));
    }
    else {
      await db_cliient.addUser(username, theme_id)
      .then( (db_result) => {
        console.log(db_result);
        res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(db_result));
      })
      .catch( (err) => {
        console.log(err);
        res.status(500).header('Content-Type', 'application/json').send(JSON.stringify({"message" : err})); // status code 500 = internal server error
      });
    };
  }
});

app.get('/api/history', async (req, res) => {

  const requestAccessToken = req.headers.authorization.substring(7, req.headers.authorization.length);
  const user_id = req.headers.user_id;
  //console.log("access_token = " + requestAccessToken);
  //console.log("user_id = " + user_id);

  if (requestAccessToken !== globalAccessToken) {
    res.status(403).send(JSON.stringify({ 'error': 'Access token is not valid.' })); // status code 403 = forbidden -> server refuses to authorize user
  }
  else {
    await db_cliient.getUserHistory(user_id)
    .then( (db_result) => {
      res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(db_result));
    })
    .catch( (err) => {
      res.status(404).header('Content-Type', 'application/json').send(JSON.stringify({"message" : err}));
    });
  }
});

app.post('/api/theme', async (req, res) => {
  const requestAccessToken = req.headers.authorization.substring(7, req.headers.authorization.length);

  if (requestAccessToken !== globalAccessToken) {
    res.status(403).send(JSON.stringify({ 'error': 'Access token is not valid.' })); // status code 403 = forbidden -> server refuses to authorize user
  }
  else {
    //console.log(req);
    req.body = JSON.parse(req.body);

    var user_id = req.body["user_id"];
    var theme_id = req.body["theme_id"];

    console.log("================================");
    console.log(user_id);
    console.log(theme_id);

    await db_cliient.setUserTheme(user_id, theme_id)
    .then( (db_result) => {
      //console.log(db_result);
      res.status(200).header('Content-Type', 'application/json').send(JSON.stringify({ 'message': 'theme set successfully.' }));
    })
    .catch( (err) => {
      console.log(err);
      res.status(404).header('Content-Type', 'application/json').send(JSON.stringify({"message" : err}));
    });
  }
});

// access token is required to upload zip file details
app.post('/api/uploadfile', async (req, res) => {

  const requestAccessToken = req.headers.authorization.substring(7, req.headers.authorization.length);

  if (requestAccessToken !== globalAccessToken) {
    res.status(403).send(JSON.stringify({ 'error': 'Access token is not valid.' })); // status code 403 = forbidden -> server refuses to authorize user
  }
  else {
    req.body = JSON.parse(req.body);

    var maintype = req.body["maintype"];
    var filename = req.body["filename"];
    var user_id = req.body["userid"];

    console.log(filename);
    console.log(maintype);
    console.log(user_id);

    let maintype_id;
    await db_cliient.getFileIdByName(maintype)
    .then( (db_result) => {
      console.log(db_result);
      maintype_id = db_result["id"];
    })
    .catch( (err) => {
      console.log(err);
      res.status(404).header('Content-Type', 'application/json').send(JSON.stringify({"message" : err}));
    });

    await db_cliient.postFileUpload(filename, maintype_id, user_id)
    .then( (db_result) => {
      console.log(db_result);
      res.status(200).header('Content-Type', 'application/json').send(JSON.stringify({ 'message': 'file uploaded successfully.' }));
    })
    .catch( (err) => {
      console.log(err);
      res.status(404).header('Content-Type', 'application/json').send(JSON.stringify({"message" : err}));
    });
  }
});