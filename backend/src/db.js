const sqlite3 = require('sqlite3').verbose();

//Open (or create) databse
const db = new sqlite3.Database('./projdb.sqlite', (err) => {
    if (err) {
        console.error('Error opening databse:', err.message);
    } else {
        console.log('Connected to SQLite database');
        //display users
        db.all('SELECT * from users', (err, row) => {
            if (err) {
                console.log('Error displaying users');
            } else if (row) {
                console.log('User Entries:');
                row.forEach((user, index) => {
                    console.log(user);
                });
            } else {
                console.log('Error displaying users');
            }
        });
        //display rooms
        db.all('SELECT * from rooms', (err, row) => {
            if (err) {
                console.log('Error displaying rooms');
            } else if (row) {
                console.log('Room Entries:');
                row.forEach((user, index) => {
                    console.log(user);
                });
            } else {
                console.log('Error displaying rooms');
            }
        });
        //display appointments
        console.log('Appointment Entries:');
        db.all('SELECT * from appointments', (err, row) => {
            if (err) {
                console.log('Error displaying appointments');
            } else if (row) {
                row.forEach((user, index) => {
                    console.log(user);
                });
            } else {
                console.log('Error displaying appointments');
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
        is_active INTEGER NOT NULL DEFAULT 0,
        role TEXT NOT NULL,
        provider_name TEXT UNIQUE,
        qualifications TEXT
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
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            is_booked INTEGER NOT NULL DEFAULT 0,
            user_id INTEGER,
            room_id INTEGER NOT NULL,
            appt_type TEXT,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'open',
            FOREIGN KEY (provider_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT ON UPDATE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
        notif_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        time TEXT NOT NULL,
        message TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
        )
    `);
});
//Allows the db object to be used outside of this file
module.exports = db;
