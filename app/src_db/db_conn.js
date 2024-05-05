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

    async checkUserExists(username, callback) {
        await this.pool.query('SELECT COUNT(*) AS user_count FROM Users WHERE username = $1', [username], callback);
    }

    async getUserByUsername(username, callback) {
        await this.pool.query('SELECT * FROM Users WHERE username = $1', [username], callback);
    }

    addUser(username, theme_id, callback) {
        this.pool.query('INSERT INTO Users (username, themepreference) VALUES ($1, $2) RETURNING *', [username, theme_id], callback);
    }

    getFileTypes(callback) {
        this.pool.query('SELECT * FROM filetypes', callback);
    }

    getHistory(callback) {
        this.pool.query('SELECT * FROM history', callback);
    }

    getUserHistory(user_id, callback) {
        this.pool.query('SELECT * FROM themes WHERE id = $1', [user_id], callback);
    }

    postFileUpload(filename, maintype, user_id, callback) {
        this.pool.query('INSERT INTO history (filename, mainfiletype, userid, datecreated) VALUES (\'$1\', $2, $3, CURRENT_TIMESTAMP)', [filename, maintype, user_id], callback);
    }
}

module.exports = ConnectDB;

  
  