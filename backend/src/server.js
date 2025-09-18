// server.js
const express = require('express'); //require web framework
const session = require('express-session'); // Middleware that manages user sessions (who is loged in across multipel requests) In real prod we'd use a real session store (a database or redis?)
const path = require('path'); //Built in node utility

const app = express(); //create express app
const PORT = process.env.PORT || 4000; //Set port to 4000

// -- Static "users" (for demo only). Do NOT use plaintext passwords in production.
const USERS = [
    { username: 'admin', password: 'password123', displayName: 'Admin User' },
    { username: 'sam', password: 'letmein', displayName: 'Sam' },
];

// Middleware
app.use(express.json()); //Lets express parse incoming json (without it req.body would be undefined)

// Session (in-memory store — fine for dev; NOT for production)
//When a user logs in their session data (like username) is stored in memory on server and tied to cookie "connect.sid" in browser
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'dev-secret', // use strong value in prod
        resave: false, //dont save session to store unless modified?
        saveUninitialized: false, //dont create empty sessions for anon users
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

// API: login (POST request)
//Once the server recieves a POST with param '/api/login' the handler function(req, res) => is called
app.post('/api/login', (req, res) => {
    // Simulate load time
    setTimeout(() => {
        const { username, password } = req.body || {}; //parse POST body into username and password
        if (!username || !password) return res.status(400).json({ ok: false, message: 'Missing' }); // If username or password not recieved, respond accordingly

        const user = USERS.find((u) => u.username === username && u.password === password); // returns first element in USERS array where POSTed username/password match
        if (!user) return res.status(401).json({ ok: false, message: 'Invalid credentials' }); //If no user is returned, respond accordingly

        // Save minimal info to session
        req.session.user = { username: user.username, displayName: user.displayName };
        return res.json({ ok: true, user: req.session.user }); //Return ok and session user
    }, 2000);
});

// API: check current user (lets frontend check "am I logged in") (GET request from frontend)
//Used by "RequireAuth"
app.get('/api/me', (req, res) => {
    //Simulate loading
    setTimeout(() => {
        if (req.session && req.session.user) return res.json({ ok: true, user: req.session.user });
        return res.status(401).json({ ok: false, message: 'Not authenticated' });
    }, 2000);
});

// API: logout (destroys users session on server, clears cookies, afterward /api/me will return "Not Authenticated")
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ ok: false, message: 'Logout failed' });
        res.clearCookie('connect.sid'); //clears cookie from browser
        return res.json({ ok: true }); //return ok
    });
});

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
