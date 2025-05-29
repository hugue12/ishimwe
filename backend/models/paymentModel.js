const { pool } = require('../config/db');

class Payment {
  static async create(paymentData) {
    try {
      const { recordNumber, amountPaid, paymentDate } = paymentData;
      const [result] = await pool.execute(
        'INSERT INTO Payment (RecordNumber, AmountPaid, PaymentDate) VALUES (?, ?, ?)',
        [recordNumber, amountPaid, paymentDate]
      );
      return { success: true, paymentNumber: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, sp.PlateNumber, sp.ServiceDate, 
               c.CarType, c.CarSize, c.DriverName, c.PhoneNumber,
               pkg.PackageName, pkg.PackageDescription, pkg.PackagePrice
        FROM Payment p
        JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package pkg ON sp.PackageNumber = pkg.PackageNumber
        ORDER BY p.PaymentNumber DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByPaymentNumber(paymentNumber) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, sp.PlateNumber, sp.ServiceDate, 
               c.CarType, c.CarSize, c.DriverName, c.PhoneNumber,
               pkg.PackageName, pkg.PackageDescription, pkg.PackagePrice
        FROM Payment p
        JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package pkg ON sp.PackageNumber = pkg.PackageNumber
        WHERE p.PaymentNumber = ?
      `, [paymentNumber]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByRecordNumber(recordNumber) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, sp.PlateNumber, sp.ServiceDate, 
               c.CarType, c.CarSize, c.DriverName, c.PhoneNumber,
               pkg.PackageName, pkg.PackageDescription, pkg.PackagePrice
        FROM Payment p
        JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package pkg ON sp.PackageNumber = pkg.PackageNumber
        WHERE p.RecordNumber = ?
      `, [recordNumber]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(paymentNumber, paymentData) {
    try {
      const { recordNumber, amountPaid, paymentDate } = paymentData;
      const [result] = await pool.execute(
        'UPDATE Payment SET RecordNumber = ?, AmountPaid = ?, PaymentDate = ? WHERE PaymentNumber = ?',
        [recordNumber, amountPaid, paymentDate, paymentNumber]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(paymentNumber) {
    try {
      const [result] = await pool.execute('DELETE FROM Payment WHERE PaymentNumber = ?', [paymentNumber]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async findByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, sp.PlateNumber, sp.ServiceDate, 
               c.CarType, c.CarSize, c.DriverName, c.PhoneNumber,
               pkg.PackageName, pkg.PackageDescription, pkg.PackagePrice
        FROM Payment p
        JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package pkg ON sp.PackageNumber = pkg.PackageNumber
        WHERE p.PaymentDate BETWEEN ? AND ?
        ORDER BY p.PaymentDate DESC
      `, [startDate, endDate]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Payment;
