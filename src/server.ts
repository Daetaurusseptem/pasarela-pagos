import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

export default class Server {
  public app = express();
  private port = process.env.PORT || 3000;

  constructor() {
    this.configure();
    this.routes();
  }

  private configure() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private routes() {
    this.app.use('/api', authRoutes);
    this.app.use('/api', paymentRoutes);
  }

  public async start() {
    await mongoose.connect(process.env.MONGO_URI || '');
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
