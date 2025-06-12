import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const jwtSecret = process.env.JWT_SECRET || 'secret';

export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashed });
    res.json({ message: 'Usuario creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registro fallido' });
  }
}

export async function login(req: Request, res: Response): Promise<any> {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret);
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el login' });
  }
}
