// server.js
const express = require('express'); //require web framework
const path = require('path'); //Built in node utility

//Middleware
const session = require('express-session'); // Middleware that manages user sessions (who is loged in across multipel requests) In real prod we'd use a real session store (a database or redis?)

//SQLite (Runs db file once)
const db = require('./db');
const dbhelper = require('./db-helper');

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

// ================================Login=====================================================

// API: login (POST request)
//Once the server recieves a POST with param '/api/login' the handler function(req, res) => is called
//TODO: Check hashed password
app.post('/api/login', (req, res) => {
    // Simulate load time
    setTimeout(() => {
        const { email, password } = req.body || {}; //parse POST body into email and password
        if (!email || !password) return res.status(400).json({ ok: false, message: 'Missing email or password' }); // If email or password not recieved, respond accordingly

        db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
            if (err) {
                return res.status(500).json({ ok: false, message: 'Login Error', error: err.message });
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
    }, 2000);
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
                return res.status(500).json({ ok: false, message: 'Registration Failed', error: err.message });
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
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort === 'lastname' ? 'lastname' : 'id'; //whitelist allowed sorting fields

    //Prevent SQL injection
    const sql = `SELECT * FROM users ORDER BY ${sort} ASC LIMIT ?`; //column name "sort" cannot be passed as a param in db.all

    db.all(sql, [limit], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message, message: 'Fetch Users Failed' });
        } else if (rows) {
            return res.json({ success: true, results: rows, count: rows.length }); //Wrap rows in object, useful for including metadata
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
    db.get('SELECT user_id, first_name, last_name, role, email, provider_name FROM users WHERE email = ?', [userEmail], (err, row) => {
        if (err) {
            return res.status(500).json({ ok: false, message: 'Error fetching active user', error: err.message });
        }

        if (!row) {
            return res.status(404).json({ ok: false, message: 'User not found' });
        }

        return res.json({ ok: true, user: row });
    });
});

// ================================Appointments=====================================================
app.post('/api/appointments', (req, res) => {
    const { userID, title, type, date, room, time, description, role } = req.body;

    if (role !== 'provider') {
        return res.status(400).json({ ok: false, message: 'You must be a service provider to create appointments!' });
    }

    // Basic input validation (avoid empty values)
    if (!title || !type || !room || !time || !description) {
        return res.status(400).json({ ok: false, message: 'All fields are required' });
    }

    //Split time into start and end time
    const times = time.split('-');
    const roomNum = parseInt(room); //to check if this room exists

    //TODO: Check room availability during time slot within query
    db.get('SELECT room_id FROM rooms WHERE room_num = ?', [roomNum], (err, row) => {
        if (err) {
            return res.status(500).json({ ok: false, message: 'Error fetching room data', error: err.message });
        }
        if (!row) {
            return res.status(404).json({ ok: false, message: 'Room not found' });
        }

        //room exists then, get its id
        const roomID = row.room_id;
        //create appointment
        dbhelper.createAppointment(userID, title, times[0], times[1], roomID, type, date, description, (err, result) => {
            if (err) {
                return res.status(500).json({ ok: false, message: 'Error inserting appointment', error: err.message });
            } else {
                //if result exists then access .appt_id otherwise return entire "result"
                return res.status(201).json({ ok: true, appt_id: result?.appt_id ?? result });
            }
        });
    });
});

//return list of all appointments
//TODO: verify credentials
app.get('/api/appointments/all', (req, res) => {
    dbhelper.getAppointmentsForList((err, results) => {
        if (err) {
            return res.status(500).json({ ok: false, message: 'Error retreiving Appointments', error: err.message });
        } else {
            return res.status(201).json({ ok: true, results: results });
        }
    });
});

app.post('/api/appointments/book', (req, res) => {
    const { userID, apptID } = req.body;
    dbhelper.bookAppointment(apptID, userID, (err, results) => {
        if (err) {
            return res.status(500).json({ ok: false, message: 'Error booking Appointments', error: err.message });
        } else {
            return res.status(201).json({ ok: true, message: 'Appointment Successfully Booked' });
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
