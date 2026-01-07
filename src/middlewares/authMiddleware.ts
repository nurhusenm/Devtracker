import { type Request,type Response,type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// We create a custom Interface so TypeScript knows 'user' exists
export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Get the Token from the Header
  // The client sends: "Authorization: Bearer <token>"
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // 2. No Token? You can't come in.
  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  try {
    // 3. Verify the Token (Check the Wax Seal)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    // 4. Attach the user data to the request object
    // We cast 'req' to 'AuthRequest' so TypeScript doesn't complain
    (req as AuthRequest).user = decoded;

    // 5. Let them pass!
    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};