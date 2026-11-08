import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// Register a new user
export const registerUser = async (req, res) => {
    try {
        
        console.log('Registration request received');
console.log('Request body:', req.body);


        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required.'
            });
        }

        //Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.'
            });
        }

        //Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters.'
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedName) {
            return res.status(400).json({
                success: false,
                message: 'Name cannot be empty.'
            });
        }

        // Check whether email already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE LOWER(email) = $1',
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        //Insert user into PostgreSQL
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [normalizedName, normalizedEmail, passwordHash]
        );


        console.log('User inserted successfully');
        
        return res.status(201).json({
            success: true,
            message: 'Registration successful.',
            user: result.rows[0]
        });

    } catch (error) {
       
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        console.error('Registration error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};