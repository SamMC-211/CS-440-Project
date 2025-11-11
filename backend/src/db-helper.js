// dbHelper.js
const db = require('./db');

// ---------------- USERS ----------------

// Create/register a new user or provider
function createUser(firstName, lastName, email, password, role, providerName, qualifications, callback) {
    const sql = `
		INSERT INTO users (first_name, last_name, email, password, role, provider_name, qualifications, is_active)
		VALUES (?, ?, ?, ?, ?, ?, ?, 1)
	`;
    db.run(sql, [firstName, lastName, email, password, role, providerName, qualifications], function (err) {
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
function createAppointment(providerId, title, startTime, endTime, roomId, apptType, date, description, callback) {
    const sql = `
		INSERT INTO appointments (provider_id, title, start_time, end_time, room_id, appt_type, date, description, status, is_booked)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', 0)
	`;
    //this.lastID = this(statement object just executed) lastID = (auto incremented ID of last inserted row)
    db.run(sql, [providerId, title, startTime, endTime, roomId, apptType, date, description], function (err) {
        callback(err, { appt_id: this?.lastID });
    });
}

// User books an appointment
/*
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
*/

// User books an appointment WITH conflict checks
function bookAppointment(apptId, userId, callback) {
    // get the appointment slot details
    const getApptSql = 'SELECT * FROM appointments WHERE appt_id = ?';

    db.get(getApptSql, [apptId], (err, appt) => {
        if (err) {
          console.log("here", err)
          return callback(err);
        }
        if (!appt) return callback(new Error('Appointment not found.'));
        if (appt.is_booked || appt.status !== 'open') {
            return callback(new Error('This appointment slot is already booked.'));
        }

        // check if the user already has a conflicting appointment
        const conflictSql = `
			SELECT * FROM appointments
			WHERE user_id = ?
			AND status = 'booked'
			AND (
				(start_time < ? AND end_time > ?)
				OR (start_time >= ? AND start_time < ?)
			)
      AND date = ?
		`;

        db.get(conflictSql, [userId, appt.end_time, appt.start_time, appt.start_time, appt.end_time, appt.date], (err, conflict) => {
            if (err){
              return callback(err);
            }
            if (conflict) {
                return callback(new Error('User already has an appointment at this time.'));
            }

            // book the appointment
            const updateSql = `
				UPDATE appointments
				SET user_id = ?, is_booked = 1, status = 'booked'
				WHERE appt_id = ? AND status = 'open'
			`;

            db.run(updateSql, [userId, apptId], function (err) {
                if (err) {
                  return callback(err);
                }
                if (this.changes === 0) {
                  return callback(new Error('Failed to book appointment (might already be booked).'));
                }
                callback(null, { message: 'Appointment booked successfully', appt_id: apptId });
            });
        });
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

// check if an appt already exists for a given provider/time/room/day
function getAppointmentByDetails(providerId, startTime, endTime, roomId, callback) {
    const sql = `
		SELECT *
		FROM appointments
		WHERE provider_id = ?
		AND room_id = ?
		AND (
			(start_time < ? AND end_time > ?) // overlap condition
			OR (start_time >= ? AND start_time < ?)
		)
	`;

    db.get(sql, [providerId, roomId, endTime, startTime, startTime, endTime], (err, row) => {
        if (err) return callback(err);
        if (!row) return callback(null, null); // no conflict
        callback(null, row); // return conflicting appt
    });
}

//Made adjustment to also pull user info of bookee?
function getAppointmentsForList(callback) {
    const sql = `
    SELECT
      appointments.appt_id      AS appt_id,
      p.provider_name       AS provider_name,
      p.first_name          AS provider_firstname,
      p.last_name           AS provider_lastname,
      appointments.appt_type    AS appt_type,
      rooms.room_num            AS room_num,
      appointments.status       AS status,
      appointments.is_booked    AS is_booked,
      appointments.user_id      AS user_id,
      appointments.start_time   AS start_time,
      appointments.end_time     AS end_time,
      appointments.date         AS date,
      appointments.title        AS title,
      appointments.description  AS description,
      appointments.user_id      AS user_id
    FROM appointments
    JOIN users p  ON appointments.provider_id = p.user_id
    LEFT JOIN users u ON appointments.user_id = u.user_id
    JOIN rooms   ON appointments.room_id     = rooms.room_id
    ORDER BY appointments.start_time ASC
  `;
    db.all(sql, [], (err, rows) => {
        callback(err, rows);
    });
}

// ---------------- NOTIFICATIONS ----------------
// Get all notifications
function getNotifications(callback) {
    const sql = `SELECT * FROM notifications ORDER BY time DESC`;
    db.all(sql, [], (err, rows) => callback(err, rows));
}

// Get notifications for a specific user (most recent first)
function getNotificationsByUser(userId, callback) {
    const sql = `
    SELECT *
    FROM notifications
    WHERE user_id = ?
    ORDER BY time DESC
  `;
    db.all(sql, [userId], (err, rows) => callback(err, rows));
}

// Get a single notification by ID
function getNotificationById(notifId, callback) {
    const sql = `SELECT * FROM notifications WHERE notif_id = ?`;
    db.get(sql, [notifId], (err, row) => callback(err, row || null));
}

// Create a notification (time defaults to now)
function createNotification(userId, message, callback) {
    const sql = `
    INSERT INTO notifications (user_id, time, message)
    VALUES (?, datetime('now'), ?)
  `;
    db.run(sql, [userId, message], function (err) {
        if (err) return callback(err);
        callback(null, { notif_id: this.lastID });
    });
}

// Delete a notification
function deleteNotification(notifId, callback) {
    const sql = `DELETE FROM notifications WHERE notif_id = ?`;
    db.run(sql, [notifId], function (err) {
        if (err) return callback(err);
        callback(null, { changes: this?.changes });
    });
}
// updated sql query
function cancelAppointmentUpdated(apptId, callback) {
    // First query: reopen the slot in appointments table
    const sql1 = `
    UPDATE appointments
    SET user_id = NULL,
        is_booked = 0,
        status = 'open'
    WHERE appt_id = ?
  `;

    // Second query: add an entry to the notification table
    const sql2 = `
    INSERT INTO notifications (user_id, time, message)
    SELECT provider_id, start_time, 'Appointment was cancelled and slot reopened.'
    FROM appointments
    WHERE appt_id = ?
  `;

    db.serialize(() => {
        db.run(sql1, [apptId], function (err) {
            if (err) return callback(err);
            // insert notification only if update succeeded
            db.run(sql2, [apptId], function (err2) {
                callback(err2, { changes: this?.changes });
            });
        });
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
    getAppointmentByDetails,
    getNotifications,
    getNotificationsByUser,
    getNotificationById,
    createNotification,
    deleteNotification,
    cancelAppointmentUpdated,
};
