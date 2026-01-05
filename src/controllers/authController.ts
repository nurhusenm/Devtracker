import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';


const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Use .env in production!

// 1. REGISTER (Join the Club)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return; 
    }

    // Hash the password (The Magic Blender)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save User
    const newUser = new User({ username, email, 
        
        password: passwordHash });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

// 2. LOGIN (Get the Wristband)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        res.status(400).json({ message: "Invalid credentials" }); // Generic message for security
        return;
    }

    // Compare Password (Is the raw password same ingredients as the Smoothie?)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
    }

    // Create Token (The Wristband)
    const token = jwt.sign(
      { userId: user._id, role: "developer" }, // Payload (Transparent Bag)
      JWT_SECRET,                              // Secret Key (The Wax Seal)
      { expiresIn: '1h' }                      // Expiration
    );

    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};