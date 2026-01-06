// src/server.ts
import express, {type Request, type Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // <--- Import Mongoose
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import authRouter from './routes/authRoutes.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes);

// --- Database Connection ---
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("Mongo URI is missing in .env");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// ---------------------------

app.get('/', (req: Request, res: Response) => {
  res.send('DevTracker API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});