const { pool } = require('../config/db');

class Package {
  static async create(packageData) {
    try {
      const { packageName, packageDescription, packagePrice } = packageData;
      const [result] = await pool.execute(
        'INSERT INTO Package (PackageName, PackageDescription, PackagePrice) VALUES (?, ?, ?)',
        [packageName, packageDescription, packagePrice]
      );
      return { success: true, packageNumber: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM Package ORDER BY PackageNumber');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByNumber(packageNumber) {
    try {
      const [rows] = await pool.execute('SELECT * FROM Package WHERE PackageNumber = ?', [packageNumber]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(packageNumber, packageData) {
    try {
      const { packageName, packageDescription, packagePrice } = packageData;
      const [result] = await pool.execute(
        'UPDATE Package SET PackageName = ?, PackageDescription = ?, PackagePrice = ? WHERE PackageNumber = ?',
        [packageName, packageDescription, packagePrice, packageNumber]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(packageNumber) {
    const connection = await pool.getConnection();

    try {
      // Start a transaction
      await connection.beginTransaction();

      // First, delete related payments
      await connection.execute('DELETE FROM Payment WHERE PackageNumber = ?', [packageNumber]);

      // Then, delete related service packages
      await connection.execute('DELETE FROM ServicePackage WHERE PackageNumber = ?', [packageNumber]);

      // Finally, delete the package
      const [result] = await connection.execute('DELETE FROM Package WHERE PackageNumber = ?', [packageNumber]);

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
}

module.exports = Package;
