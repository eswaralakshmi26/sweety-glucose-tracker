import pool from '../config/db.js';

const VALID_TIME_SLOTS = [
    'Morning (fasting)',
    'After breakfast',
    'After lunch',
    'After dinner'
];

export const addGlucoseReading = async (req, res) => {
    let client;

    try {
        const userId = req.user.userId;
        const { reading_date, time_slot, glucose_value } = req.body;

        if (
            glucose_value === undefined ||
            glucose_value === null ||
            glucose_value === ''
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a glucose value.'
            });
        }

        const value = Number(glucose_value);

        if (!Number.isInteger(value) || value < 40 || value > 600) {
            return res.status(400).json({
                success: false,
                message: 'Value must be between 40 and 600 mg/dl.'
            });
        }

        if (!reading_date) {
            return res.status(400).json({
                success: false,
                message: 'Please select a date.'
            });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(reading_date)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid date.'
            });
        }

        const date = new Date(`${reading_date}T00:00:00.000Z`);

        if (
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== reading_date
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid date.'
            });
        }

        if (!VALID_TIME_SLOTS.includes(time_slot)) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid time slot.'
            });
        }

        const futureDateCheck = await pool.query(
           `SELECT $1::date > (NOW() AT TIME ZONE 'Asia/Kolkata')::date
     AS is_future`,
            [reading_date]
        );

        if (futureDateCheck.rows[0].is_future) {
            return res.status(400).json({
                success: false,
                message: 'Date cannot be in the future.'
            });
        }

        client = await pool.connect();

        await client.query('BEGIN');

        await client.query(
            'SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
            [String(userId), reading_date]
        );

        const existingReading = await client.query(
            `SELECT id FROM glucose_readings
             WHERE user_id = $1
             AND reading_date = $2
             AND time_slot = $3`,
            [userId, reading_date, time_slot]
        );

        if (existingReading.rows.length > 0) {
            await client.query('ROLLBACK');

            return res.status(409).json({
                success: false,
                message: `You already have an ${time_slot} reading for this date.`
            });
        }

        const dailyCount = await client.query(
            `SELECT COUNT(*) 
             FROM glucose_readings
             WHERE user_id = $1
             AND reading_date = $2`,
            [userId, reading_date]
        );

        if (Number(dailyCount.rows[0].count) >= 4) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'You can add only 4 readings per day.'
            });
        }

        const result = await client.query(
            `INSERT INTO glucose_readings
             (user_id, reading_date, time_slot, glucose_value)
             VALUES ($1, $2, $3, $4)
             RETURNING id, reading_date, time_slot, glucose_value, created_at`,
            [userId, reading_date, time_slot, value]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Glucose reading added successfully.',
            reading: result.rows[0]
        });

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }

        console.error('Add glucose reading error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });

    } finally {
        if (client) {
            client.release();
        }
    }
};


export const getGlucoseReadings = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT id, reading_date, time_slot, glucose_value, created_at
             FROM glucose_readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            readings: result.rows
        });

    } catch (error) {
        console.error('Get glucose readings error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};


export const updateGlucoseReading = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { reading_date, time_slot, glucose_value } = req.body;

        const allowedSlots = [
            'Morning (fasting)',
            'After breakfast',
            'After lunch',
            'After dinner'
        ];

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reading ID.'
            });
        }

        if (!reading_date || glucose_value === undefined || !time_slot) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all reading details.'
            });
        }

        if (
            !Number.isInteger(Number(glucose_value)) ||
            Number(glucose_value) < 40 ||
            Number(glucose_value) > 600
        ) {
            return res.status(400).json({
                success: false,
                message: 'Value must be between 40 and 600 mg/dl.'
            });
        }

        if (!allowedSlots.includes(time_slot)) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid time slot.'
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid date.'
            });
        }

        const dateCheck = await client.query(
            `SELECT $1::date > (NOW() AT TIME ZONE 'Asia/Kolkata')::date
AS is_future`,
            [reading_date]
        );

        if (dateCheck.rows[0].is_future) {
            return res.status(400).json({
                success: false,
                message: 'Date cannot be in the future.'
            });
        }

        await client.query('BEGIN');

        await client.query(
            'SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))',
            [String(userId), reading_date]
        );

        const existingReading = await client.query(
            `SELECT id FROM glucose_readings
             WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (existingReading.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Reading not found.'
            });
        }

        const duplicate = await client.query(
            `SELECT id FROM glucose_readings
             WHERE user_id = $1
             AND reading_date = $2
             AND time_slot = $3
             AND id != $4`,
            [userId, reading_date, time_slot, id]
        );

        if (duplicate.rows.length > 0) {
            await client.query('ROLLBACK');

            return res.status(409).json({
                success: false,
                message: `You already have an ${time_slot} reading for this date.`
            });
        }

        const dailyCount = await client.query(
            `SELECT COUNT(*)::int AS count
             FROM glucose_readings
             WHERE user_id = $1
             AND reading_date = $2
             AND id != $3`,
            [userId, reading_date, id]
        );

        if (dailyCount.rows[0].count >= 4) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'You can add only 4 readings per day.'
            });
        }

        const result = await client.query(
            `UPDATE glucose_readings
             SET reading_date = $1,
                 time_slot = $2,
                 glucose_value = $3
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [reading_date, time_slot, Number(glucose_value), id, userId]
        );

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Glucose reading updated successfully.',
            reading: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');

        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'A reading already exists for this date and time slot.'
            });
        }

        console.error('Update glucose reading error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });

    } finally {
        client.release();
    }
};

export const deleteGlucoseReading = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reading ID.'
            });
        }

        const result = await pool.query(
            `DELETE FROM glucose_readings
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Glucose reading not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Glucose reading deleted successfully.'
        });

    } catch (error) {
        console.error('Delete glucose reading error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};