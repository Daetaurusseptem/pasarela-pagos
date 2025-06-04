import { Schema, model, Document } from 'mongoose';

export interface IPayment extends Document {
  name: string;
  email: string;
  amount: number;
  stripeId: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  stripeId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IPayment>('Payment', PaymentSchema);
