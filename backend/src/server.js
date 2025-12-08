// server.js
const express = require('express'); //require web framework
const path = require('path'); //Built in node utility
const { DateToString, StringToDate, isNullOrWhiteSpace } = require('./helpers');
//Middleware
const session = require('express-session'); // Middleware that manages user sessions (who is loged in across multipel requests) In real prod we'd use a real session store (a database or redis?)

//SQLite (Runs db file once)
const db = require('./db');
const dbhelper = require('./db-helper');
const { get } = require('http');

//Server initializaton
const app = express(); //create express app
const PORT = process.env.PORT || 4000; //Set port to 4000

// -- Static "users" (for demo only). Do NOT use plaintext passwords in production.
const USERS = [
    { username: 'admin', password: 'password123', displayName: 'Admin User' },
    { username: 'sam', password: 'letmein', displayName: 'Sam' },
];

// ================================Session Middleware=====================================================
app.use(express.json()); //Lets express parse incoming json (without it req.body would be undefined)

// Session (in-memory store — fine for dev; NOT for production)
//When a user logs in their session data (like username) is stored in memory on server and tied to cookie "connect.sid" in browser
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'dev-secret', // use strong value in prod
        resave: false, //dont save session to store unless modified?
        saveUninitialized: false, //specifies when a session is initialized (false: will only initialize when something is written to req.session)
        cookie: {
            httpOnly: true, //JS cant read cookies (more secure)
            secure: false, // set true in production (HTTPS)
            sameSite: 'lax', //protects against CSRF?
            maxAge: 1000 * 60 * 60 * 24, // 1 day (when cookie/session expires)
            // maxAge: null, //session cookie, until they close the BROWSER
            // maxAge: 0, //User will need to log in after any action that triggers RequireAuth
        },
    })
);

// ================================TODO: DELETE=====================================================
// dbhelper.createRoom(101, () => {});
// dbhelper.createRoom(102, () => {});
// dbhelper.createRoom(103, () => {});
// dbhelper.clearAllData();

// dbhelper.createUser(
//     'Sam',
//     'Christenson',
//     'sammc@gmail.com',
//     'password',
//     'admin',
//     '',
//     '',
//     function (err) {
//         console.log('Error' + err);
//     }
// );

// const sqla = `
//     INSERT INTO users (first_name, last_name, email, password, role, provider_name, qualifications, is_active)
// 		VALUES (?, ?, ?, ?, ?, ?, ?, 1)`;

// db.run(sqla, [
//     'Sam',
//     'Christenson',
//     'sammc@gmail.com',
//     'password',
//     'admin',
//     '',
//     '',
// ]);
// dbhelper.createAdmin();
// dbhelper.insertPreviousDemoAppointments();

const sql = `
        UPDATE appointments 
        SET provider_id = 11
        WHERE appt_id = 16
	`;
const sql2 = `
        UPDATE appointments 
        SET provider_id = 12
        WHERE appt_id = 17
	`;
// will need to change first value to id of Abby
// db.run(sql);
// db.run(sql2);

// ================================Login=====================================================

// API: login (POST request)
//Once the server recieves a POST with param '/api/login' the handler function(req, res) => is called
//TODO: Check hashed password
/*
app.post('/api/login', (req, res) => {
    // Simulate load time
    const { email, password } = req.body || {}; //parse POST body into email and password
    if (!email || !password) return res.status(400).json({ ok: false, message: 'Missing email or password' }); // If email or password not recieved, respond accordingly

    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Login Error',
                error: err.message,
            });
        }

        if (!row) {
            return res.status(401).json({ ok: false, message: 'Invalid Credentials' });
        }

        if (row.password === password) {
            req.session.user = { email: row.email }; //save user session, initializes session
            console.log('Session just initialized:', req.session);
            return res.json({ ok: true, user: req.session.user });
        } else {
            return res.status(401).json({ ok: false, message: 'Invalid Credentials' });
        }
    });
});
*/

// new app.post that checks the hashed password
const bcrypt = require('bcrypt');

app.post('/api/login', (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ ok: false, message: 'Missing email or password' });
    }

    // Fetch user by email ONLY
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Login Error',
                error: err.message,
            });
        }

        if (!row) {
            return res.status(401).json({ ok: false, message: 'Invalid Credentials' });
        }

        if(row.is_active == 0) {
            return res.status(401).json({ ok: false, message: 'User is inactive' });
        }

        // Compare the supplied password with the hashed password in DB
        bcrypt.compare(password, row.password, (err, isMatch) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ ok: false, message: 'Server error' });
            }

            if (!isMatch) {
                return res.status(401).json({ ok: false, message: 'Invalid Credentials' });
            }

            // Password matched — create session
            req.session.user = { 
                email: row.email,
                user_id: row.user_id,
                role: row.role,
                first_name: row.first_name,
                last_name: row.last_name
            };

            console.log('Session just initialized:', req.session);

            return res.json({ ok: true, user: req.session.user });
        });
    });
});


// API: check current user (lets frontend check "am I logged in") (GET request from frontend)
//Used by "RequireAuth"
app.get('/api/me', (req, res) => {
    //Simulate loading
    if (req.session && req.session.user) return res.json({ ok: true, user: req.session.user }); //if a session
    return res.status(401).json({ ok: false, message: 'Not authenticated' });
});

// API: logout (destroys users session on server, clears cookies, afterward /api/me will return "Not Authenticated")
app.post('/api/logout', (req, res) => {
    console.log('Destroying session:', req.session.user);
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ ok: false, message: 'Logout failed' });
        res.clearCookie('connect.sid'); //clears cookie from browser
        console.log('Session destroyed:');
        return res.json({ ok: true }); //return ok
    });
});

// ================================Register=====================================================
//TODO: Hash pasword before storing
app.post('/api/register', (req, res) => {
    //Simulate Load time
    const { firstName, lastName, email, password, isProvider, providerName, qualifications } = req.body;

    let role = isProvider ? 'provider' : 'user';

    // Basic input validation (avoid empty values)
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ ok: false, message: 'All fields are required' });
    }
    //If user is a provider they must have a provider name
    if (role === 'provider' && !providerName) {
        return res.status(400).json({ ok: false, message: 'Service Provider Name Required' });
    }
    //If user is not provider set providerName = null
    if (role === 'user' && providerName) {
        return res.status(400).json({ ok: false, message: 'User Cannot Have a Provider Name ' });
    }

    //Check that user with email does not already exist
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err.message,
                message: 'Check for Existing User Failed',
            });
        } else if (row) {
            return res.status(400).json({
                ok: false,
                message: 'A user with this email already exists',
            });
        }

        dbhelper.createUser(firstName, lastName, email, password, role, providerName, qualifications, (err, result) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Registration Failed',
                    error: err.message,
                });
            } else {
                return res.status(201).json({ ok: true });
            }
        });
    });
});

// ================================Return user data=====================================================
//TODO: Secure user get
//GET /api/users?limit=10&sort=lastname
app.get('/api/users', (req, res) => {
    //Use query params passed in request route
    const limit = parseInt(req.query.limit) || 40;
    const sort = req.query.sort === 'last_name' ? 'last_name' : 'user_id'; //whitelist allowed sorting fields

    //Prevent SQL injection
    const sql = `SELECT * FROM users ORDER BY ${sort} ASC LIMIT ?`; //column name "sort" cannot be passed as a param in db.all

    db.all(sql, [limit], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message,
                message: 'Fetch Users Failed',
            });
        } else if (rows) {
            return res.json({
                success: true,
                results: rows.map(row => {
                    return {
                        userID: row.user_id,
                        firstName: row.first_name,
                        lastName: row.last_name,
                        role: row.role,
                        email: row.email,
                        providerName: row.provider_name,
                        isActive: row.is_active,
                    };
                }),
                count: rows.length,
            }); //Wrap rows in object, useful for including metadata
            // return res.json(rows);
        }
    });
});

app.get('/api/users/active', (req, res) => {
    // Check if a session exists
    if (!req.session.user) {
        return res.status(401).json({ ok: false, message: 'No active user found' });
    }

    const userEmail = req.session.user.email;

    // Now you can query the DB for the rest of the user info
    db.get('SELECT user_id, first_name, last_name, role, email, provider_name, is_active FROM users WHERE email = ?', [userEmail], (err, row) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error fetching active user',
                error: err.message,
            });
        }

        if (!row) {
            return res.status(404).json({ ok: false, message: 'User not found' });
        }

        return res.json({ ok: true, user: row });
    });
});

app.patch('/api/users/activate', (req, res) => { 
    var userId = req.body.userID;

    dbhelper.activateUser(userId, (err, results) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error activating user',
                error: err.message,
            });
        } else {
            return res.status(200).json({ ok: true, results: results });
        }
    });
});

app.patch('/api/users/deactivate', (req, res) => { 
    var userId = req.body.userID;

    dbhelper.deactivateUser(userId, (err, results) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deactivating user',
                error: err.message,
            });
        } else {
            return res.status(200).json({ ok: true, results: results });
        }
    });
});

// ================================Appointments=====================================================

// CREATE APPOINTMENT
app.post('/api/appointments', (req, res) => {
    const { userID, title, type, date, roomID, time, description, role } = req.body;
    // console.log('Request Body: ' + userID, title, type, date, roomID, time, description, role);

    if (role !== 'provider') {
        return res.status(400).json({
            ok: false,
            message: 'You must be a service provider to create appointments!',
        });
    }

    // Basic input validation (avoid empty values)
    if (!title || !type || !roomID || !time || !description) {
        return res.status(400).json({ ok: false, message: 'All fields are required' });
    }

    //Split time into start and end time
    const times = time.split('-');

    //SQL to check for conflicting appointments
    const conflictSql = `
      SELECT *
      FROM appointments
      WHERE room_id = ?
        AND date = ?
        AND start_time = ?
        AND end_time = ?
      LIMIT 1
    `;

    // console.log('Params: ' + roomID, date, times[0], times[1]);

    //Query for conflicting appointments
    db.get(conflictSql, [roomID, date, times[0], times[1]], (err, conflictRow) => {
        if (err) {
            console.error('DB error checking conflicts:', err);
            return res.status(500).json({
                ok: false,
                message: 'Database error',
                error: err.message,
            });
        }

        // console.log('Conflict Check Results: ' + conflictRow);

        if (conflictRow) {
            // Conflict found
            return res.status(409).json({
                ok: false,
                message: 'Time slot conflict - appointment already exists for this room/date/time',
                conflictApptId: conflictRow.appt_id,
            });
        }

        //create appointment
        dbhelper.createAppointment(userID, title, times[0], times[1], roomID, type, date, description, (err, result) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error creating appointment',
                    error: err.message,
                });
            } else {
                //if result exists then access .appt_id otherwise return entire "result"
                return res.status(201).json({
                    ok: true,
                    appt_id: result?.appt_id ?? result,
                });
            }
        });
    });
});

//return list of all appointments
//TODO: verify credentials
app.get('/api/appointments/all', (req, res) => {
    dbhelper.getAppointmentsForList((err, results) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error retreiving Appointments',
                error: err.message,
            });
        } else {
            return res.status(201).json({ ok: true, results: results });
        }
    });
});

app.get('/api/appointments/booked/user', (req, res) => { //probably badly named endpoint
    
    const { userID, minDate, maxDate, type, role } = req.query;

    if (role != 'admin') {
        res.status(301).json({
                ok: false,
                message: 'need to be an admin',
                error: e.message,
            });
    }

    dbhelper.GetAppointmentsByBookedUser(userID, (err, results) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error retrieving appointments',
                error: err.message,
            });
        }


        try {
            const { userID, minDate, maxDate, type, role } = req.query;

            // Parse date filters
            const min = !isNullOrWhiteSpace(minDate) ? StringToDate(minDate) : null;
            const max = !isNullOrWhiteSpace(maxDate) ? StringToDate(maxDate) : null;

            // Convert result dates to Date objects for comparison
            for (let i = 0; i < results.length; i++) {
                results[i].date = StringToDate(results[i].date);
            }

            // Apply filters
            if (!isNullOrWhiteSpace(type)) {
                results = results.filter((r) => r.appt_type == type);
            }

            if (min) {
                results = results.filter((r) => r.date >= min);
            }

            if (max) {
                results = results.filter((r) => r.date <= max);
            }

            // Convert date back to string for response
            for (let i = 0; i < results.length; i++) {
                results[i].date = DateToString(results[i].date);
            }

            return res.status(200).json({ ok: true, results });
        } catch (e) {
            return res.status(500).json({
                ok: false,
                message: 'Error processing appointment data',
                error: e.message,
            });
        }
    });
});

app.get('/api/appointments', (req, res) => {
    dbhelper.getAppointmentsForList((err, results) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error retrieving appointments',
                error: err.message,
            });
        }

        try {
            const { userID, minDate, maxDate, type, role } = req.query;

            // Parse date filters
            const min = !isNullOrWhiteSpace(minDate) ? StringToDate(minDate) : new Date();
            const max = !isNullOrWhiteSpace(maxDate) ? StringToDate(maxDate) : null;

            // Convert result dates to Date objects for comparison
            for (let i = 0; i < results.length; i++) {
                results[i].date = StringToDate(results[i].date);
            }

            // Apply filters
            if (!isNullOrWhiteSpace(type)) {
                results = results.filter((r) => r.appt_type == type);
            }

            if (min) {
                results = results.filter((r) => r.date >= min);
            }

            if (max) {
                results = results.filter((r) => r.date <= max);
            }

            // Convert date back to string for response
            for (let i = 0; i < results.length; i++) {
                results[i].date = DateToString(results[i].date);
            }

            return res.status(200).json({ ok: true, results });
        } catch (e) {
            return res.status(500).json({
                ok: false,
                message: 'Error processing appointment data',
                error: e.message,
            });
        }
    });
});

app.get('/api/appointments/summary', (req, res) => {
    dbhelper.getAppointmentsForList((err, results) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error retrieving appointments',
                error: err.message,
            });
        }

        try {
            const { minDate, maxDate, } = req.query;
            let data = {
                bookedCount: 0,
                canceledCount: 0,
                numAppointments: 0,
                numConsult: 0,
                numConsultBooked: 0,
                numTraining: 0,
                numTrainingBooked: 0,
                numFollow: 0,
                numFollowBooked: 0,
            }

            // Parse date filters
            const min = !isNullOrWhiteSpace(minDate) ? StringToDate(minDate) : new Date();
            const max = !isNullOrWhiteSpace(maxDate) ? StringToDate(maxDate) : null;

            // Convert result dates to Date objects for comparison
            for (let i = 0; i < results.length; i++) {
                results[i].date = StringToDate(results[i].date);
            }

            if (min) {
                results = results.filter((r) => r.date >= min);
            }

            if (max) {
                results = results.filter((r) => r.date <= max);
            }

            console.log("results", results);

            // Apply filters
            data.numAppointments = results.length;
            data.numAppointments = results.filter((r) => r.status == 'booked').length;
            data.numAppointments = results.filter((r) => r.status == 'cancelled').length;

            

            console.log("results too", results);
            data.numConsult = results.filter((r) => r.appt_type == 'Consultation').length;
            data.numTraining = results.filter((r) => r.appt_type == 'Training').length;
            data.numFollow = results.filter((r) => r.appt_type == 'Follow-up').length;
            
            data.numConsult = results.filter((r) => r.appt_type == 'Consultation' && r.status == 'booked').length;
            data.numTraining = results.filter((r) => r.appt_type == 'Training' && r.status == 'booked').length;
            data.numFollow = results.filter((r) => r.appt_type == 'Follow-up' && r.status == 'booked').length;

            // Convert date back to string for response
            for (let i = 0; i < results.length; i++) {
                results[i].date = DateToString(results[i].date);
            }

            return res.status(200).json({ ok: true, data: data });
        } catch (e) {
            return res.status(500).json({
                ok: false,
                message: 'Error processing appointment data',
                error: e.message,
            });
        }
    });
});

app.get('/api/appointments/booked', (req, res) => {
    dbhelper.getAppointmentsForList((err, results) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error retrieving appointments',
                error: err.message,
            });
        }

        try {
            const { userID } = req.query;
           // console.log('[DEBUG] Query parameters:', req.query);

            const userIdNum = Number(userID);
           // console.log('[DEBUG] Parsed userID as number:', userIdNum);

            // Convert result dates to Date objects for comparison
            for (let i = 0; i < results.length; i++) {
                results[i].date = StringToDate(results[i].date);
            }
            results = results.filter((r) => r.date >= new Date() && r.user_id === userIdNum);
            // Convert date back to string for response
            for (let i = 0; i < results.length; i++) {
                results[i].date = DateToString(results[i].date);
            }
           // console.log('Booked Results (Post Filter/Conversion):', results);

            return res.status(200).json({ ok: true, results });
        } catch (e) {
            return res.status(500).json({
                ok: false,
                message: 'Error processing appointment data',
                error: e.message,
            });
        }
    });
});

app.post('/api/appointments/book', (req, res) => {
    const { userID, apptID } = req.body;
    dbhelper.bookAppointment(apptID, userID, (err, results) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error booking Appointments',
                error: err.message,
            });
        } else {
            return res.status(201).json({ ok: true, message: 'Appointment Successfully Booked' });
        }
    });
});

app.post('/api/appointments/cancel', (req, res) => {
    const { userID, apptID } = req.body;

    // Basic validation
    if (userID == null || apptID == null) {
        return res.status(400).json({
            ok: false,
            message: 'Missing required fields: userID and apptID',
        });
    }

    dbhelper.cancelAppointment(userID, apptID, (err, results) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error cancelling Appointments',
                error: err.message,
            });
        } else {
            return res.status(201).json({
                ok: true,
                message: 'Appointment Successfully Canceled',
            });
        }
    });
});
// ================================Notifications=====================================================
app.get('/api/notifications/user', (req, res) => {
    const { userID } = req.query;
    dbhelper.getNotificationsByUser(userID, (err, results) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error pulling user notifications',
                error: err.message,
            });
        } else {
            return res.status(201).json({ ok: true, results });
        }
    });
});

// ================================Finalize=====================================================
/* Optional: serve frontend in production
   Put your Vite build into /dist and serve it:
*/
// When deployed, this would serve my react build output "vite build" -> "dist/" (dont need when running locally bc Vite runs on its own dev server)
if (process.env.NODE_ENV === 'production') {
    const dist = path.join(__dirname, 'dist');
    app.use(express.static(dist));
    app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html'))); //Unknown routes just send index.hmtl so react router can handle it
}

//Spins up server on given port (can now hit "http://localhost:4000/api/login", "/api/me", "/api/logout")
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
