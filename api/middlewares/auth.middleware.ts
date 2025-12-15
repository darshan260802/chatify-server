// middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  console.log(token);
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  const decodedUser = jwt.decode(token.replace('Bearer ', ''));
  console.log('De', decodedUser);
  
  if (!decodedUser) {
    return res.status(401).json({ success: false, message: 'Invalid Token' });
  }

  req.body.user = decodedUser;

  next();
}
