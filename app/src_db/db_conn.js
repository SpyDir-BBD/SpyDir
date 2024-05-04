const { Pool } = require('pg');

class ConnectDB {
    constructor(user, server, db_name, db_password) {
        this.pool = new Pool({
            user: user,
            host: server,
            database: db_name,
            password: db_password,
            port: 5432, 
            ssl: {
              rejectUnauthorized: false
            }
        });
    }

    connect() {
        try {
            this.pool.connect();
        } 
        catch (error) {
            console.log("db connection failed");
            process.exit(1);
        }
    }

    getThemes(callback) {
        this.pool.query('SELECT * FROM themes', callback);
    }

    getTheme(theme_id, callback) {
        this.pool.query('SELECT * FROM themes WHERE id = $1', [theme_id], callback);
    }

    addUser(username, theme_id, callback) {
        this.pool.query('INSERT INTO Users (username, themepreference) VALUES ($1, $2) RETURNING *', [username, theme_id], callback);
    }

    getFileType(callback) {

    }

    getFileTypes(callback) {
        this.pool.query('SELECT * FROM filetypes', callback);
    }

    setHistory(callback) {

    }

    getHistory(callback) {
        this.pool.query('SELECT * FROM history', callback);
    }

    getUserHistory(user_id, callback) {
        this.pool.query('SELECT * FROM themes WHERE id = $1', [user_id], callback);
    }
}

module.exports = ConnectDB;

  
  