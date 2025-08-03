import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './routes/route.js'; 
import connectDB from './config/db.js';  
import { connect } from 'mongoose';
dotenv.config();
connectDB()

const app: any = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://82.180.144.143:3000",
    "http://82.180.144.143",
    "http://82.180.144.143:3000/api"
  ],
  credentials: true    
}));
app.use('/api', authRouter);
// Sample route to test cookies
app.get('/', (req: any, res: any) => {
  res.send('Cookie set');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
