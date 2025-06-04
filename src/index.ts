import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import Payment from './models/Payment';
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

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error', err));

app.post('/api/payments', async (req, res) => {
  try {
    const { name, email, amount, token } = req.body;

    const charge = await stripe.paymentIntents.create({
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
      stripeId: charge.id
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

app.get('/api/payments', async (_req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json(payments);
});

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
