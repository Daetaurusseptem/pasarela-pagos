import { Request, Response } from 'express';
import Stripe from 'stripe';
import PDFDocument from 'pdfkit';
import Payment from '../models/Payment';
import { IUser } from '../models/User';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const globalStripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });

export async function createPayment(req: Request, res: Response) {
  try {
    const { name, email, amount, token } = req.body;
    const user = (req as any).user as IUser;
    const clientStripe = globalStripe;

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment failed' });
  }
}

export async function listPayments(req: Request, res: Response) {
  const user = (req as any).user as IUser;
  const query = user.role === 'admin' ? {} : { user: user._id };
  const payments = await Payment.find(query).sort({ createdAt: -1 });
  res.json(payments);
}
