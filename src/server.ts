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
    this.pageRoutes();
    this.routes();
  }

  private configure() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'ejs');
  }

  private pageRoutes() {
    this.app.get('/', (_req, res) => res.render('index'));
    this.app.get('/login', (_req, res) => res.render('login'));
    this.app.get('/register', (_req, res) => res.render('register'));
    this.app.get('/history', (_req, res) => res.render('history'));
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
