// dbHelper.js
const db = require('./db');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// ---------------- USERS ----------------

// Create/register a new user or provider - no hashing used for password
/*
function createUser(firstName, lastName, email, password, role, providerName, qualifications, callback) {
    const sql = `
		INSERT INTO users (first_name, last_name, email, password, role, provider_name, qualifications, is_active)
		VALUES (?, ?, ?, ?, ?, ?, ?, 1)
	`;
    db.run(sql, [firstName, lastName, email, password, role, providerName, qualifications], function (err) {
        callback(err, { user_id: this?.lastID });
    });
}
*/

// Create/register a new user or provider (PASSWORD HASHED)
function createUser(firstName, lastName, email, password, role, providerName, qualifications, callback) {
    // Hash the password before storing it
    bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) return callback(err);

        const sql = `
            INSERT INTO users (first_name, last_name, email, password, role, provider_name, qualifications, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `;

        db.run(sql, [firstName, lastName, email, hashedPassword, role, providerName, qualifications], function (err) {
            callback(err, { user_id: this?.lastID });
        });
    });
}

function deactivateUser(userId, callback) {
    const sql = `
        UPDATE users
        SET is_active = 0
        WHERE user_id = ?
    `;

    db.run(sql, [userId], function (err) {
        callback(err, { changes: this?.changes });
    });
}

function activateUser(userId, callback) {
    const sql = `
        UPDATE users
        SET is_active = 1
        WHERE user_id = ?
    `;

    db.run(sql, [userId], function (err) {
        callback(err, { changes: this?.changes });
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

// User books an appointment WITH conflict checks
function bookAppointment(apptId, userId, callback) {
    // get the appointment slot details
    const getApptSql = 'SELECT * FROM appointments WHERE appt_id = ?';

    db.get(getApptSql, [apptId], (err, appt) => {
        if (err) {
            return callback(err);
        }
        if (!appt) return callback(new Error('Appointment not found.'));
        if (appt.is_booked || appt.status !== 'open') {
            return callback(new Error('This appointment slot is already booked.'));
        }

        const apptDate = appt.date;
        const apptStartTime = appt.start_time;
        const apptEndTime = appt.end_time;

        // check if the user already has a conflicting appointment
        const conflictSql = `
			SELECT * FROM appointments
			WHERE user_id = ? 
                AND date = ? 
                AND start_time = ?
                AND end_time = ? 
		`;

        db.get(conflictSql, [userId, apptDate, apptStartTime, apptEndTime], (err, conflict) => {
            if (err) {
                return callback(err);
            }
            if (conflict) {
                return callback(new Error('User has an existing appointment booked during this time.'));
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
                callback(null, {
                    message: 'Appointment booked successfully',
                    appt_id: apptId,
                });
            });
        });
    });
}

// Cancel an appointment (make it open again)
function cancelAppointment(userID, apptId, callback) {
    const getRoleSql = `
        SELECT role
        FROM users
        WHERE user_id = ?
    `;

    const userCancelSql = `
		UPDATE appointments
		SET user_id = NULL, is_booked = 0, status = 'open'
		WHERE appt_id = ?
	`;
    const providerCancelSql = `
        UPDATE appointments
		SET user_id = NULL, is_booked = 1, status = 'cancelled'
		WHERE appt_id = ?
    `;

    const getApptSql = `SELECT appt_id, provider_id, user_id, is_booked, title FROM appointments WHERE appt_id = ?`;

    // const getApptProvIdSql = `SELECT provider_id FROM appointments WHERE appt_id = ?`;
    // const getApptUsrIdSql = 'SELECT user_id FROM appointments WHERE appt_id = ?';

    const createNotifSql = `
        INSERT INTO notifications (user_id, time, message)
        SELECT ?, datetime('now','localtime'),
            'Appointment (' || title || ') was cancelled by the provider.'
        FROM appointments
        WHERE appt_id = ?
    `;

    //get caller role
    db.get(getRoleSql, [userID], function (err, row) {
        if (err) return callback(err);
        if (!row || !row.role) return callback(new Error('Caller user not found or has no role'));

        //Capture user role
        const role = row.role;

        //get appt details
        db.get(getApptSql, [apptId], function (err2, apptRow) {
            if (err2) return callback(err2);
            if (!apptRow) return callback(new Error('Appointment not found'));

            //Capture Appointment Provider ID
            const appointmentProviderId = apptRow.provider_id;
            const appointmentUserId = apptRow.user_id; // may be null
            const isBooked = Number(apptRow.is_booked ?? 0) !== 0;

            let sqlToRun;

            if (role === 'user') {
                if (!isBooked) return callback(new Error('Appointment is not booked'));
                if (Number(appointmentUserId) !== Number(userID)) {
                    return callback(new Error('User is not the owner of this booking'));
                }
                sqlToRun = userCancelSql;
            } else if (role === 'provider') {
                if (Number(appointmentProviderId) !== Number(userID)) {
                    return callback(new Error('Provider not authorized to cancel this appointment'));
                }
                sqlToRun = providerCancelSql;
            } else {
                return callback(new Error('Role not allowed to cancel appointments'));
            }

            //perform update
            db.run(sqlToRun, [apptId], function (err3) {
                if (err3) return callback(err3);

                // Check changes
                if (!this || !this.changes || this.changes === 0) {
                    return callback(new Error('No appointment was updated (maybe state already changed)'));
                }

                //If appointment appointment was booked and canceled by provider
                if (appointmentUserId && role === 'provider') {
                    db.run(createNotifSql, [appointmentUserId, apptId], function (err4) {
                        if (err4) {
                            // Notification failed — this is non-fatal for cancellation itself.
                            return callback(null, {
                                ok: true,
                                changes: this.changes,
                                notifError: err4.message,
                            });
                        }
                        console.log('Notif Inserted:' + this.changes);
                        return callback(null, {
                            ok: true,
                            changes: this.changes,
                        });
                    });
                } else {
                    // No notification necessary — return success
                    return callback(null, { ok: true, changes: this.changes });
                }
            });
        });
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
      appointments.provider_id  AS provider_id,
      p.provider_name       AS provider_name,
      p.first_name          AS provider_firstname,
      p.last_name           AS provider_lastname,
      appointments.appt_type    AS appt_type,
      appointments.room_id      AS room_id,
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
    ORDER BY appointments.date DESC
  `;
    db.all(sql, [], (err, rows) => {
        callback(err, rows);
    });
}

function getAppointmentsByBookedUser(userId, callback) {
    const sql = `
        SELECT
            appointments.appt_id      AS appt_id,
            appointments.provider_id  AS provider_id,
            p.provider_name           AS provider_name,
            p.first_name              AS provider_firstname,
            p.last_name               AS provider_lastname,
            appointments.appt_type    AS appt_type,
            appointments.room_id      AS room_id,
            rooms.room_num            AS room_num,
            appointments.status       AS status,
            appointments.is_booked    AS is_booked,
            appointments.user_id      AS user_id,
            appointments.start_time   AS start_time,
            appointments.end_time     AS end_time,
            appointments.date         AS date,
            appointments.title        AS title,
            appointments.description  AS description
        FROM appointments
        JOIN users p ON appointments.provider_id = p.user_id
        LEFT JOIN users u ON appointments.user_id = u.user_id
        JOIN rooms ON appointments.room_id = rooms.room_id
        WHERE appointments.user_id = ?
        ORDER BY appointments.date DESC
    `;

    db.all(sql, [userId], (err, rows) => {
        callback(err, rows);
    });
}

// Function that gets all appointments made by a given provider
function getAppointmentsByProvider(providerId, callback) {
    const sql = `
        SELECT
            appointments.appt_id      AS appt_id,
            appointments.provider_id  AS provider_id,
            p.provider_name           AS provider_name,
            p.first_name              AS provider_firstname,
            p.last_name               AS provider_lastname,
            appointments.appt_type    AS appt_type,
            appointments.room_id      AS room_id,
            rooms.room_num            AS room_num,
            appointments.status       AS status,
            appointments.is_booked    AS is_booked,
            appointments.user_id      AS user_id,
            appointments.start_time   AS start_time,
            appointments.end_time     AS end_time,
            appointments.date         AS date,
            appointments.title        AS title,
            appointments.description  AS description
        FROM appointments
        JOIN users p ON appointments.provider_id = p.user_id
        LEFT JOIN users u ON appointments.user_id = u.user_id
        JOIN rooms ON appointments.room_id = rooms.room_id
        WHERE appointments.provider_id = ?
        ORDER BY appointments.date DESC
    `;

    db.all(sql, [providerId], (err, rows) => {
        callback(err, rows);
    });
}

// Get all appointments by type/category (appt_type)
function getAppointmentsByType(apptType, callback) {
    const sql = `
        SELECT
            appointments.appt_id      AS appt_id,
            appointments.provider_id  AS provider_id,
            p.provider_name           AS provider_name,
            p.first_name              AS provider_firstname,
            p.last_name               AS provider_lastname,
            appointments.appt_type    AS appt_type,
            appointments.room_id      AS room_id,
            rooms.room_num            AS room_num,
            appointments.status       AS status,
            appointments.is_booked    AS is_booked,
            appointments.user_id      AS user_id,
            appointments.start_time   AS start_time,
            appointments.end_time     AS end_time,
            appointments.date         AS date,
            appointments.title        AS title,
            appointments.description  AS description
        FROM appointments
        JOIN users p ON appointments.provider_id = p.user_id
        LEFT JOIN users u ON appointments.user_id = u.user_id
        JOIN rooms ON appointments.room_id = rooms.room_id
        WHERE appointments.appt_type = ?
        ORDER BY appointments.date DESC, appointments.start_time ASC
    `;

    db.all(sql, [apptType], (err, rows) => {
        callback(err, rows);
    });
}

function cancelAllAppointmentsByUser(userId, callback) {
    const updateSql = `
        UPDATE appointments
        SET user_id = NULL,
            is_booked = 0,
            status = 'open'
        WHERE user_id = ?
    `;

    const notifySql = `
        INSERT INTO notifications (user_id, time, message)
        SELECT provider_id,
               datetime('now','localtime'),
               'A user cancelled one of their appointments.'
        FROM appointments
        WHERE user_id IS NULL
          AND provider_id IS NOT NULL
    `;

    db.serialize(() => {
        db.run(updateSql, [userId], function (err) {
            if (err) return callback(err);

            const affected = this.changes;

            db.run(notifySql, function (err2) {
                if (err2) {
                    return callback(null, {
                        ok: true,
                        cancelled: affected,
                        notifError: err2.message,
                    });
                }

                callback(null, {
                    ok: true,
                    cancelled: affected,
                });
            });
        });
    });
}

function cancelAllAppointmentsByProvider(providerId, callback) {
    const updateSql = `
        UPDATE appointments
        SET user_id = NULL,
            is_booked = 1,
            status = 'cancelled'
        WHERE provider_id = ?
    `;

    const notifySql = `
        INSERT INTO notifications (user_id, time, message)
        SELECT user_id,
               datetime('now','localtime'),
               'Your appointment was cancelled by the provider.'
        FROM appointments
        WHERE provider_id = ?
          AND user_id IS NOT NULL
    `;

    db.serialize(() => {
        db.run(updateSql, [providerId], function (err) {
            if (err) return callback(err);

            const affected = this.changes;

            db.run(notifySql, [providerId], function (err2) {
                if (err2) {
                    return callback(null, {
                        ok: true,
                        cancelled: affected,
                        notifError: err2.message,
                    });
                }

                callback(null, {
                    ok: true,
                    cancelled: affected,
                });
            });
        });
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

function providerCancelAppointmentUpdated(apptId, callback) {
    const sql = `
		UPDATE appointments
		SET user_id = NULL, is_booked = 1, status = 'cancelled'
		WHERE appt_id = ?
	`;
    db.run(sql, [apptId], function (err) {
        callback(err, { changes: this?.changes });
    });
}

function clearAllData() {
    //except rooms and users
    var sql = `
    DELETE FROM appointments;
	`;
    db.run(sql);

    var sql2 = `
    DELETE FROM notifications;
	`;
    db.run(sql2);
}

function createAdmin() {
    const sql = `
		INSERT INTO users (first_name, last_name, email, password, role, provider_name, qualifications, is_active)
		VALUES (?, ?, ?, ?, ?, ?, ?, 1)
	`;
    db.run(sql, ['admin', 'user', 'admin@gmail.com', 'password', 'admin', '', '']);
}

function insertPreviousDemoAppointments() {
    const sql = `
        INSERT INTO appointments (
            provider_id,
            title,
            start_time,
            end_time,
            room_id,
            appt_type,
            "date",
            description,
            status,
            is_booked
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'booked', 1)
    `;

    // Demo appointment rows
    const rows = [
        ['11', 'Hair Highlight', '3:00', '4:00', '1', 'Training', '10/15/2025', 'Training'],
        ['12', 'Face Moisturizer Treatment', '3:00', '4:00', '2', 'Training', '10/15/2025', 'Training'],
        ['11', 'Hair Cut', '3:00', '4:00', '1', 'Consultation', '11/22/2025', 'Consultation'],
        ['11', 'Color', '4:00', '5:00', '1', 'Training', '10/15/2025', 'Training'],
        ['12', 'Cleansing Facial', '3:00', '4:00', '1', 'Consultation', '11/22/2025', 'Consultation'],
        ['12', 'Acne Clearing Facial', '4:00', '5:00', '1', 'Follow-up', '10/15/2025', 'Follow-up'],
    ];

    // Insert each row
    rows.forEach((params, index) => {
        db.run(sql, params, function (err) {
            if (err) {
                console.error(`Insert ${index + 1} FAILED:`, err.message);
            } else {
                console.log(`Insert ${index + 1} OK (rowid: ${this.lastID})`);
            }
        });
    });
}

function resetForDemoTest() {
    // Delete appointments first
    db.run(`DELETE FROM appointments;`, function (err) {
        if (err) throw err;

        // Then delete notifications
        db.run(`DELETE FROM notifications;`, function (err) {
            if (err) throw err;

            // Now insert previous demo appointments
            insertPreviousDemoAppointments();
        });
    });
}

function migratePasswordsToBcrypt(callback) {
    const selectSql = `SELECT user_id, password FROM users`;

    db.all(selectSql, [], async (err, users) => {
        if (err) return callback(err);

        // No users found
        if (!users || users.length === 0) {
            return callback(null, { updated: 0 });
        }

        let updatedCount = 0;

        // Process each user sequentially to avoid overloading bcrypt
        for (const user of users) {
            try {
                // Hash existing plaintext password
                const hashed = await bcrypt.hash(user.password, SALT_ROUNDS);

                const updateSql = `
                    UPDATE users
                    SET password = ?
                    WHERE user_id = ?
                `;

                await new Promise((resolve, reject) => {
                    db.run(updateSql, [hashed, user.user_id], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                updatedCount++;
            } catch (err) {
                return callback(err, { message: 'Appointment booked successfully' });
            }
        }

        callback(err, { message: 'Appointment booked successfully' });
    });
}

module.exports = {
    migratePasswordsToBcrypt,
    getAppointmentsByBookedUser,
    getAppointmentsByProvider,
    cancelAllAppointmentsByUser,
    cancelAllAppointmentsByProvider,
    resetForDemoTest,
    activateUser,
    deactivateUser,
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
    clearAllData,
    createAdmin,
    insertPreviousDemoAppointments,
};
