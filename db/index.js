var pg = require("pg");
const dotenv = require("dotenv");
dotenv.config();

module.exports = class appDb {
  constructor() {
    console.log(process.env.DB_USER);
    this.db = new pg.Client({
      user: process.env.DB_USER,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      /* ssl: {
        rejectUnauthorized: false
      } */
    });
    this.db.connect((err) => {
      if (!err) {
        console.log("Successfully connected to db!");
        this.createTable();
      } else {
        console.log("error occured connecting to db!");
        console.log(err);
      }
    });
  }

  createTable = async () => {
    let sql = `
          BEGIN;  
            create table if not exists users(id serial primary key, username text, datejoined timestamp, img text, phoneno text, email text, fullname text, password text);
          COMMIT;`;
    this.run(sql);
  };

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.query(sql, params, (err, res) => {
        if (err) {
          console.log("error running sql" + sql);
          console.log(err);
          reject(err);
        } else {
          resolve(res.rows);
        }
      });
    });
  }
  stop() {
    this.db.end();
  }
};
