const Payment = require('../models/paymentModel');

class PaymentController {
  // Create new payment
  static async createPayment(req, res) {
    try {
      const { recordNumber, amountPaid, paymentDate } = req.body;

      // Validation
      if (!recordNumber || !amountPaid || !paymentDate) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      if (amountPaid <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount paid must be greater than 0'
        });
      }

      const result = await Payment.create({
        recordNumber,
        amountPaid,
        paymentDate
      });

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: result
      });
    } catch (error) {
      console.error('Create payment error:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          success: false,
          message: 'Invalid service record number'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all payments
  static async getAllPayments(req, res) {
    try {
      const payments = await Payment.findAll();
      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get payment by payment number
  static async getPaymentByPaymentNumber(req, res) {
    try {
      const { paymentNumber } = req.params;
      const payment = await Payment.findByPaymentNumber(paymentNumber);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get payment by record number
  static async getPaymentByRecordNumber(req, res) {
    try {
      const { recordNumber } = req.params;
      const payment = await Payment.findByRecordNumber(recordNumber);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found for this service record'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Get payment by record number error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update payment
  static async updatePayment(req, res) {
    try {
      const { paymentNumber } = req.params;
      const { recordNumber, amountPaid, paymentDate } = req.body;

      // Validation
      if (!recordNumber || !amountPaid || !paymentDate) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      if (amountPaid <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount paid must be greater than 0'
        });
      }

      const updated = await Payment.update(paymentNumber, {
        recordNumber,
        amountPaid,
        paymentDate
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        message: 'Payment updated successfully'
      });
    } catch (error) {
      console.error('Update payment error:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          success: false,
          message: 'Invalid service record number'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete payment
  static async deletePayment(req, res) {
    try {
      const { paymentNumber } = req.params;
      const deleted = await Payment.delete(paymentNumber);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        message: 'Payment deleted successfully'
      });
    } catch (error) {
      console.error('Delete payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get payments by date range
  static async getPaymentsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const payments = await Payment.findByDateRange(startDate, endDate);
      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Get payments by date range error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Generate bill for a payment
  static async generateBill(req, res) {
    try {
      const { paymentNumber } = req.params;
      const payment = await Payment.findByPaymentNumber(paymentNumber);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Generate bill data
      const bill = {
        billNumber: `BILL-${payment.PaymentNumber}`,
        date: new Date().toISOString().split('T')[0],
        customer: {
          name: payment.DriverName,
          phone: payment.PhoneNumber
        },
        car: {
          plateNumber: payment.PlateNumber,
          type: payment.CarType,
          size: payment.CarSize
        },
        service: {
          packageName: payment.PackageName,
          description: payment.PackageDescription,
          serviceDate: payment.ServiceDate,
          price: payment.PackagePrice
        },
        payment: {
          amountPaid: payment.AmountPaid,
          paymentDate: payment.PaymentDate,
          paymentNumber: payment.PaymentNumber
        },
        total: payment.AmountPaid
      };

      res.json({
        success: true,
        data: bill
      });
    } catch (error) {
      console.error('Generate bill error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = PaymentController;
