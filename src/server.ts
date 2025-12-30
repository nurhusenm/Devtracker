// src/server.ts
import express, {type Request, type Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // <--- Import Mongoose

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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