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

    //async getThemes() {
    //    const result = await this.pool.query('SELECT * FROM themes');
    //    return result.rows;
    //}

    async getTheme(theme_id) {
        const result = await this.pool.query('SELECT * FROM themes WHERE id = $1', [theme_id]);
        return result.rows[0];
    }

    async setUserTheme(user_id, theme_id) {
        const result = await this.pool.query('UPDATE users SET themepreference = $1 WHERE id = $2', [theme_id, user_id]);
        return result;
    }

    async checkUserExists(username) {
        const result = await this.pool.query('SELECT COUNT(*) AS user_count FROM Users WHERE username = $1', [username]);
        if (result.rows[0]["user_count"]==1) {
            return true;
        }
        return false;
    }

    async getUserByUsername(username) {
        const result = await this.pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        var data = {
            "message" : "User already exists in database",
            "user_details" : result.rows[0]
        };
        return data;
    }

    async addUser(username, theme_id) {
        const result = await this.pool.query('INSERT INTO Users (username, themepreference) VALUES ($1, $2) RETURNING *', [username, theme_id]);
        var data = {
            "message" : "User already exists in database",
            "user_details" : result.rows[0]
        };
        return data;
    }

    //async getFileTypes() {
    //    const result = await this.pool.query('SELECT * FROM filetypes');
    //    return result.rows;
    //}

    //async getHistory() {
    //    const result = await this.pool.query('SELECT * FROM history');
    //    return result.rows;
    //}

    async getUserHistory(user_id) {
        const result = await this.pool.query('SELECT * FROM history WHERE userid = $1', [user_id]);
        return result.rows;
    }

    async getFileIdByName(name) {
        const result = await this.pool.query('SELECT * FROM filetypes WHERE filename = $1', [name]);
        return result.rows[0];
    }

    async postFileUpload(filename, maintype, user_id) {
        const result = await this.pool.query('INSERT INTO history (filename, mainfiletype, userid, datecreated) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)', [filename, maintype, user_id]);
        return result;
    }
}

module.exports = ConnectDB;

  
  