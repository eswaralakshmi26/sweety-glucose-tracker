import pool from '../config/db.js';

const validateDate = (date) => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
    );
};

const generateReport = async (userId, startDate, endDate, reportType) => {
    const readingsResult = await pool.query(
        `SELECT id, reading_date, time_slot, glucose_value
         FROM glucose_readings
         WHERE user_id = $1
         AND reading_date >= $2
         AND reading_date <= $3
         ORDER BY reading_date ASC,
         CASE time_slot
             WHEN 'Morning (fasting)' THEN 1
             WHEN 'After breakfast' THEN 2
             WHEN 'After lunch' THEN 3
             WHEN 'After dinner' THEN 4
         END ASC`,
        [userId, startDate, endDate]
    );

    const statisticsResult = await pool.query(
        `SELECT
            MAX(glucose_value)::int AS highest,
            MIN(glucose_value)::int AS lowest,
            ROUND(AVG(glucose_value), 1) AS average,
            COUNT(*)::int AS total_readings
         FROM glucose_readings
         WHERE user_id = $1
         AND reading_date >= $2
         AND reading_date <= $3`,
        [userId, startDate, endDate]
    );

    const statistics = statisticsResult.rows[0];

    return {
        success: true,
        reportType,
        startDate,
        endDate,
        summary: {
            highest: statistics.highest,
            lowest: statistics.lowest,
            average: statistics.average === null
                ? null
                : Number(statistics.average),
            totalReadings: statistics.total_readings
        },
        readings: readingsResult.rows
    };
};

// Daily Report
export const getDailyReport = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date } = req.query;

        if (!validateDate(date)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid report date.'
            });
        }

        const futureDate = await pool.query(
            `SELECT $1::date > (NOW() AT TIME ZONE 'Asia/Kolkata')::date
     AS is_future`,
            [date]
        );

        if (futureDate.rows[0].is_future) {
            return res.status(400).json({
                success: false,
                message: 'Report date cannot be in the future.'
            });
        }

        const report = await generateReport(
            userId,
            date,
            date,
            'Daily Report'
        );

        return res.status(200).json(report);

    } catch (error) {
        console.error('Daily report error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to generate daily report.'
        });
    }
};

// Month-to-Date Report
export const getMonthToDateReport = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date } = req.query;

        if (!validateDate(date)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid report date.'
            });
        }
        const futureDate = await pool.query(
            `SELECT $1::date > (NOW() AT TIME ZONE 'Asia/Kolkata')::date
     AS is_future`,
            [date]
        );


        if (futureDate.rows[0].is_future) {
            return res.status(400).json({
                success: false,
                message: 'Report date cannot be in the future.'
            });
        }

        const rangeResult = await pool.query(
            `SELECT
                date_trunc('month', $1::date)::date AS start_date,
                $1::date AS end_date`,
            [date]
        );

        const { start_date, end_date } = rangeResult.rows[0];

        const report = await generateReport(
            userId,
            start_date,
            end_date,
            'Month-to-Date Report'
        );

        return res.status(200).json(report);

    } catch (error) {
        console.error('Month-to-date report error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to generate month-to-date report.'
        });
    }
};

// Previous Calendar Month Report
export const getPreviousMonthReport = async (req, res) => {
    try {
        const userId = req.user.userId;

        const rangeResult = await pool.query(
            `SELECT
                (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month')::date
                    AS start_date,
                (date_trunc('month', CURRENT_DATE) - INTERVAL '1 day')::date
                    AS end_date`
        );

        const { start_date, end_date } = rangeResult.rows[0];

        const report = await generateReport(
            userId,
            start_date,
            end_date,
            'Previous Month Report'
        );

        return res.status(200).json(report);

    } catch (error) {
        console.error('Previous month report error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to generate previous month report.'
        });
    }
};