import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'admin' | 'user';
  stripeSecret?: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  stripeSecret: { type: String }
});

export default model<IUser>('User', UserSchema);
