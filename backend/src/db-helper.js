// dbHelper.js
const db = require('./db');

// ---------------- USERS ----------------

// Create/register a new user or provider
function createUser(firstName, lastName, email, password, role, providerName, callback) {
    const sql = `
		INSERT INTO users (first_name, last_name, email, password, role, provider_name, is_active)
		VALUES (?, ?, ?, ?, ?, ?, 1)
	`;
    db.run(sql, [firstName, lastName, email, password, role, providerName], function (err) {
        callback(err, { user_id: this?.lastID });
    });
}

// Get a user by email
function getUserByEmail(email, callback) {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        callback(err, row);
    });
}

// ---------------- ROOMS ----------------

// add a room
function createRoom(roomNum, callback) {
    db.run(`INSERT INTO rooms (room_num) VALUES (?)`, [roomNum], function (err) {
        callback(err, { room_id: this?.lastID });
    });
}

// Get all rooms
function getRooms(callback) {
    db.all(`SELECT * FROM rooms`, [], (err, rows) => {
        callback(err, rows);
    });
}

// ---------------- APPOINTMENTS ----------------

// Provider creates/open a time slot
function createAppointment(providerId, startTime, endTime, roomId, apptType, callback) {
    const sql = `
		INSERT INTO appointments (provider_id, start_time, end_time, room_id, appt_type, status, is_booked)
		VALUES (?, ?, ?, ?, ?, 'open', 0)
	`;
    //this.lastID = this(statement object just executed) lastID = (auto incremented ID of last inserted row)
    db.run(sql, [providerId, startTime, endTime, roomId, apptType], function (err) {
        callback(err, { appt_id: this?.lastID });
    });
}

// User books an appointment
function bookAppointment(apptId, userId, callback) {
    const sql = `
		UPDATE appointments
		SET user_id = ?, is_booked = 1, status = 'booked'
		WHERE appt_id = ? AND status = 'open'
	`;
    //this.changes = number of rows effected
    db.run(sql, [userId, apptId], function (err) {
        callback(err, { changes: this?.changes });
    });
}

// Cancel an appointment (make it open again)
function cancelAppointment(apptId, callback) {
    const sql = `
		UPDATE appointments
		SET user_id = NULL, is_booked = 0, status = 'open'
		WHERE appt_id = ?
	`;
    db.run(sql, [apptId], function (err) {
        callback(err, { changes: this?.changes });
    });
}

// Get all appointments (optionally filter by provider or user)
function getAppointments(callback) {
    db.all(`SELECT * FROM appointments`, [], (err, rows) => {
        callback(err, rows);
    });
}

function getAppointmentsForList(callback) {
    const sql = `
    SELECT
      appointments.appt_id       AS appt_id,
      users.provider_name       AS provider_name,
      users.first_name          AS provider_firstname,
      users.last_name           AS provider_lastname,
      appointments.appt_type    AS appt_type,
      rooms.room_num            AS room_num,
      appointments.status       AS status,
      appointments.is_booked    AS is_booked,
      appointments.start_time   AS start_time,
      appointments.end_time     AS end_time,
      appointments.appt_id      AS appt_id
    FROM appointments
    JOIN users   ON appointments.provider_id = users.user_id
    JOIN rooms   ON appointments.room_id     = rooms.room_id
    ORDER BY appointments.start_time ASC
  `;

    db.all(sql, [], (err, rows) => {
        callback(err, rows);
    });
}

module.exports = {
    createUser,
    getUserByEmail,
    createRoom,
    getRooms,
    createAppointment,
    bookAppointment,
    cancelAppointment,
    getAppointments,
    getAppointmentsForList,
};
