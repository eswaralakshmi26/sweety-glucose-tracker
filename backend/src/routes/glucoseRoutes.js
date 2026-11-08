import express from 'express';

import authMiddleware from '../middleware/authMiddleware.js';
import {
    addGlucoseReading,
    getGlucoseReadings,
    deleteGlucoseReading,
    updateGlucoseReading
} from '../controllers/glucoseController.js';
const router = express.Router();

router.use(authMiddleware);

router.post('/', addGlucoseReading);
router.put('/:id', updateGlucoseReading);
router.get('/', getGlucoseReadings);
router.delete('/:id', deleteGlucoseReading);

export default router;