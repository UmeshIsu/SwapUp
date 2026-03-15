import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import shiftRoutes from './routes/shifts';
import swapRequestRoutes from './routes/swapRequests';
import chatRoutes from './routes/chat';
import devLoginRoutes from './routes/devLogin';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', service: 'SwapUp API' });
});

// Routes
app.use('/api/shifts', shiftRoutes);
app.use('/api/swap-requests', swapRequestRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', devLoginRoutes); // TEMPORARY — dev login

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`SwapUp API running on port ${PORT}`);
});

export default app;
