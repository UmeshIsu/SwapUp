import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leaveRoutes from './routes/leaveRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SwapUp TS server is running!' });
});

app.use('/api/leaves', leaveRoutes);

const PORT = (process.env.PORT as any) || 5000;
app.listen(PORT, () => {
    console.log(`SwapUp TS server running on http://localhost:${PORT}`);
});
