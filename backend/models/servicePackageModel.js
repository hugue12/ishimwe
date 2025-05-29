const { pool } = require('../config/db');

class ServicePackage {
  static async create(serviceData) {
    try {
      const { plateNumber, packageNumber, serviceDate } = serviceData;
      const [result] = await pool.execute(
        'INSERT INTO ServicePackage (PlateNumber, PackageNumber, ServiceDate) VALUES (?, ?, ?)',
        [plateNumber, packageNumber, serviceDate]
      );
      return { success: true, recordNumber: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT sp.*, c.CarType, c.CarSize, c.DriverName, c.PhoneNumber,
               p.PackageName, p.PackageDescription, p.PackagePrice
        FROM ServicePackage sp
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package p ON sp.PackageNumber = p.PackageNumber
        ORDER BY sp.RecordNumber DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByRecordNumber(recordNumber) {
    try {
      const [rows] = await pool.execute(`
        SELECT sp.*, c.CarType, c.CarSize, c.DriverName, c.PhoneNumber,
               p.PackageName, p.PackageDescription, p.PackagePrice
        FROM ServicePackage sp
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package p ON sp.PackageNumber = p.PackageNumber
        WHERE sp.RecordNumber = ?
      `, [recordNumber]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(recordNumber, serviceData) {
    try {
      const { plateNumber, packageNumber, serviceDate } = serviceData;
      const [result] = await pool.execute(
        'UPDATE ServicePackage SET PlateNumber = ?, PackageNumber = ?, ServiceDate = ? WHERE RecordNumber = ?',
        [plateNumber, packageNumber, serviceDate, recordNumber]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(recordNumber) {
    const connection = await pool.getConnection();

    try {
      // Start a transaction
      await connection.beginTransaction();

      // First, delete related payments
      await connection.execute('DELETE FROM Payment WHERE RecordNumber = ?', [recordNumber]);

      // Then, delete the service package
      const [result] = await connection.execute('DELETE FROM ServicePackage WHERE RecordNumber = ?', [recordNumber]);

      // Commit the transaction
      await connection.commit();

      return result.affectedRows > 0;
    } catch (error) {
      // Rollback the transaction if any error occurs
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  }

  static async findByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.execute(`
        SELECT sp.*, c.CarType, c.CarSize, c.DriverName, c.PhoneNumber,
               p.PackageName, p.PackageDescription, p.PackagePrice
        FROM ServicePackage sp
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package p ON sp.PackageNumber = p.PackageNumber
        WHERE sp.ServiceDate BETWEEN ? AND ?
        ORDER BY sp.ServiceDate DESC
      `, [startDate, endDate]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ServicePackage;
