const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticateSession } = require('../middleware/authMiddleware');

// All payment routes require authentication
router.use(authenticateSession);

// Payment routes
router.post('/', PaymentController.createPayment);
router.get('/', PaymentController.getAllPayments);
router.get('/date-range', PaymentController.getPaymentsByDateRange);
router.get('/bill/:paymentNumber', PaymentController.generateBill);
router.get('/record/:recordNumber', PaymentController.getPaymentByRecordNumber);
router.get('/:paymentNumber', PaymentController.getPaymentByPaymentNumber);
router.put('/:paymentNumber', PaymentController.updatePayment);
router.delete('/:paymentNumber', PaymentController.deletePayment);

module.exports = router;
