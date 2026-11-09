import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

import {
    getDailyReport,
    getMonthToDateReport,
    getPreviousMonthReport
} from '../controllers/reportController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/daily', getDailyReport);
router.get('/month-to-date', getMonthToDateReport);
router.get('/previous-month', getPreviousMonthReport);

export default router;