const sqlite3 = require('sqlite3').verbose();

//Open (or create) databse
const db = new sqlite3.Database('./projdb.sqlite', (err) => {
    if (err) {
        console.error('Error opening databse:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

//Create tables NOT HASHED PASSWORD
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
        firstname TEXT NOT NULL,
        lastname TEXT,
        email TEXT NOT NULL UNIQUE,
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL
        )'
    `);
});

//Allows the db object to be used outside of this file
module.exports = db;
