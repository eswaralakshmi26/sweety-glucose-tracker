import pool from '../src/config/db.js';
import bcrypt from 'bcryptjs';

const DEMO_USER = {
    name: 'Sweety Demo',
    email: 'demo@sweety.com',
    password: 'Demo@123'
};

const sampleReadings = [
    // Today's readings
    { daysAgo: 0, slot: 'Morning (fasting)', value: 105 },
    { daysAgo: 0, slot: 'After breakfast', value: 145 },
    { daysAgo: 0, slot: 'After lunch', value: 130 },
    { daysAgo: 0, slot: 'After dinner', value: 120 },

    // Previous days
    { daysAgo: 1, slot: 'Morning (fasting)', value: 110 },
    { daysAgo: 1, slot: 'After breakfast', value: 150 },
    { daysAgo: 2, slot: 'Morning (fasting)', value: 98 },
    { daysAgo: 2, slot: 'After lunch', value: 135 },

    // Previous calendar month (for monthly reports)
    { daysAgo: 25, slot: 'Morning (fasting)', value: 115 },
    { daysAgo: 25, slot: 'After breakfast', value: 155 },
    { daysAgo: 26, slot: 'Morning (fasting)', value: 102 },
    { daysAgo: 27, slot: 'After lunch', value: 140 }
];

const seedDatabase = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get the existing demo user, if available
        let userResult = await client.query(
            'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
            [DEMO_USER.email]
        );

        let userId;

        if (userResult.rows.length > 0) {
            userId = userResult.rows[0].id;
            console.log('Demo user already exists.');
        } else {
            const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);

            userResult = await client.query(
                `INSERT INTO users (name, email, password_hash)
                 VALUES ($1, $2, $3)
                 RETURNING id`,
                [DEMO_USER.name, DEMO_USER.email, passwordHash]
            );

            userId = userResult.rows[0].id;
            console.log('Demo user created successfully.');
        }

        // Get today's date using the application's IST timezone
        const dateResult = await client.query(
            `SELECT (NOW() AT TIME ZONE 'Asia/Kolkata')::date::text AS today`
        );

        const today = dateResult.rows[0].today;

        // Calculate sample reading dates
        const getDate = (daysAgo) => {
            const date = new Date(`${today}T00:00:00.000Z`);
            date.setUTCDate(date.getUTCDate() - daysAgo);
            return date.toISOString().slice(0, 10);
        };

        let insertedCount = 0;

        for (const reading of sampleReadings) {
            const result = await client.query(
                `INSERT INTO glucose_readings
                    (user_id, reading_date, time_slot, glucose_value)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id, reading_date, time_slot)
                 DO NOTHING
                 RETURNING id`,
                [
                    userId,
                    getDate(reading.daysAgo),
                    reading.slot,
                    reading.value
                ]
            );

            if (result.rows.length > 0) {
                insertedCount++;
            }
        }

        await client.query('COMMIT');

        console.log('Seed completed successfully.');
        console.log(`Demo email: ${DEMO_USER.email}`);
        console.log(`Demo password: ${DEMO_USER.password}`);
        console.log(`New readings inserted: ${insertedCount}`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Seed failed:', error);
        process.exitCode = 1;

    } finally {
        client.release();
        await pool.end();
    }
};

seedDatabase();
