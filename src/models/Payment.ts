import { Schema, model, Document } from 'mongoose';

export interface IPayment extends Document {
  name: string;
  email: string;
  amount: number;
  stripeId: string;
  user: Schema.Types.ObjectId;

  createdAt: Date;
}


const PaymentSchema = new Schema<IPayment>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  stripeId: { type: String, required: true },

  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },


  createdAt: { type: Date, default: Date.now }
});

export default model<IPayment>('Payment', PaymentSchema);
