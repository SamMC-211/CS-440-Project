const sqlite3 = require('sqlite3').verbose();

//Open (or create) databse
const db = new sqlite3.Database('./projdb.sqlite', (err) => {
    if (err) {
        console.error('Error opening databse:', err.message);
    } else {
        console.log('Connected to SQLite database');
        console.log('User Entries:');
        db.all('SELECT * from users', (err, row) => {
            if (err) {
                console.log('Error displaying users');
            } else if (row) {
                row.forEach((user, index) => {
                    console.log(user);
                });
            } else {
                console.log('Error displaying users');
            }
        });
    }
});

//Create tables NOT HASHED PASSWORD
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        email TEXT NOT NULL PRIMARY KEY,
        password TEXT NOT NULL
        )
    `);
});

//Allows the db object to be used outside of this file
module.exports = db;
