
const ConnectDB = require('./src_db/db_conn');
var express = require('express');

var app = express();

app.use(express.static(__dirname + '/public'));

// endpoint to render the landing page
app.get('/', (req, res) => {
  res.sendFile(__dirname +  '/public/landing.html');
});

var server = app.listen(5000);

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

/*
app.post('/user', (req, res) => {

  username = "Christo"; // username comes from an html form or something
  theme_id = 2; // discuss where username and theme_id come from
  pool.addUser(username, theme_id, (error, response) => {
    if (error) {
      console.log(error);
    }
    console.log(response.rows);
    //res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response));
  });
});
*/