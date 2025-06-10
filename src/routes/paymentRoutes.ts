import { Router } from 'express';
import { createPayment, listPayments } from '../controllers/PaymentController';
import { auth } from '../middlewares/auth';

const router = Router();

router.post('/payments', auth, createPayment);
router.get('/payments', auth, listPayments);

export default router;
