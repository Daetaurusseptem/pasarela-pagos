import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import Payment from './models/Payment';
import User, { IUser } from './models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16'
});
const jwtSecret = process.env.JWT_SECRET || 'secret';

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error', err));

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, stripeSecret } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashed, stripeSecret });
    res.json({ message: 'Usuario creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registro fallido' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret);
  res.json({ token });
});

async function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
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

function adminOnly(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user as IUser;
  if (user.role !== 'admin') return res.status(403).json({ message: 'No autorizado' });
  next();
}

app.post('/api/payments', auth, async (req, res) => {
  try {
    const { name, email, amount, token } = req.body;
    const user = (req as any).user as IUser;
    const clientStripe = user.stripeSecret ? new Stripe(user.stripeSecret, { apiVersion: '2023-10-16' }) : stripe;

    const charge = await clientStripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: token,
      confirm: true,
      receipt_email: email
    });

    const payment = await Payment.create({
      name,
      email,
      amount,
      stripeId: charge.id,
      user: user._id
    });

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.text(`Recibo de pago - ${payment._id}`);
    doc.text(`Nombre: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Monto: $${amount}`);
    doc.text(`Fecha: ${payment.createdAt.toISOString()}`);
    doc.end();
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipt-${payment._id}.pdf`);
      res.send(result);
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: 'Payment failed' });
  }
});

app.get('/api/payments', auth, async (req, res) => {
  const user = (req as any).user as IUser;
  const query = user.role === 'admin' ? {} : { user: user._id };
  const payments = await Payment.find(query).sort({ createdAt: -1 });
  res.json(payments);
});

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
