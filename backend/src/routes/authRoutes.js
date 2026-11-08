import express from 'express';

import { registerUser } from '../controllers/registerController.js';
import { loginUser } from '../controllers/loginController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/profile', authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        userId: req.user.userId
    });
});

export default router;