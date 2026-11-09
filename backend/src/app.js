import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import glucoseRoutes from './routes/glucoseRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to Sweety - Blood Glucose Tracker'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/glucose', glucoseRoutes);
app.use('/api/reports', reportRoutes);

export default app;