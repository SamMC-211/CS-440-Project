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
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 0, -- 0=false, 1=true
        role TEXT NOT NULL -- 'user', 'provider', or 'dev'
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS rooms (
        room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_num INTEGER NOT NULL UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
        appt_id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider_id INTEGER,
        start_time TEXT NOT NULL, 
        end_time TEXT NOT NULL, 
        is_booked INTEGER NOT NULL DEFAULT 0, -- 0=false, 1=true
        user_id INTEGER, 
        room_id INTEGER NOT NULL, 
        appt_type TEXT, 
        status TEXT NOT NULL DEFAULT 'open', -- 'open', 'booked', 'cancelled'
	FOREIGN KEY (provider_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT ON UPDATE CASCADE
        )
    `);
});
//Allows the db object to be used outside of this file
module.exports = db;
