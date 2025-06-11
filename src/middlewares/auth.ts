import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const jwtSecret = process.env.JWT_SECRET || 'secret';

export async function auth(req: Request, res: Response, next: NextFunction): Promise<any> {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Sin token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret) as any;
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Token inválido' });
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as IUser;
  if (user.role !== 'admin') return res.status(403).json({ message: 'No autorizado' });
  next();
}
