const { pool } = require('../config/db');

class Car {
  static async create(carData) {
    try {
      const { plateNumber, carType, carSize, driverName, phoneNumber } = carData;
      const [result] = await pool.execute(
        'INSERT INTO Car (PlateNumber, CarType, CarSize, DriverName, PhoneNumber) VALUES (?, ?, ?, ?, ?)',
        [plateNumber, carType, carSize, driverName, phoneNumber]
      );
      return { success: true, plateNumber };
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM Car ORDER BY PlateNumber');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByPlateNumber(plateNumber) {
    try {
      const [rows] = await pool.execute('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(plateNumber, carData) {
    try {
      const { carType, carSize, driverName, phoneNumber } = carData;
      const [result] = await pool.execute(
        'UPDATE Car SET CarType = ?, CarSize = ?, DriverName = ?, PhoneNumber = ? WHERE PlateNumber = ?',
        [carType, carSize, driverName, phoneNumber, plateNumber]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(plateNumber) {
    const connection = await pool.getConnection();

    try {
      console.log('Car.delete called for plate number:', plateNumber);

      // Start a transaction
      console.log('Starting transaction...');
      await connection.beginTransaction();

      // First, delete related payments
      console.log('Deleting related payments...');
      const [paymentResult] = await connection.execute('DELETE FROM Payment WHERE PlateNumber = ?', [plateNumber]);
      console.log('Payments deleted:', paymentResult.affectedRows);

      // Then, delete related service packages
      console.log('Deleting related service packages...');
      const [serviceResult] = await connection.execute('DELETE FROM ServicePackage WHERE PlateNumber = ?', [plateNumber]);
      console.log('Service packages deleted:', serviceResult.affectedRows);

      // Finally, delete the car
      console.log('Deleting car...');
      const [result] = await connection.execute('DELETE FROM Car WHERE PlateNumber = ?', [plateNumber]);
      console.log('Car deletion result:', result.affectedRows);

      // Commit the transaction
      console.log('Committing transaction...');
      await connection.commit();
      console.log('Transaction committed successfully');

      return result.affectedRows > 0;

    } catch (error) {
      // Rollback the transaction if any error occurs
      console.log('Error occurred, rolling back transaction...');
      await connection.rollback();
      console.log('Transaction rolled back');
      console.error('Car.delete error:', error);
      throw error;
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  }
}

module.exports = Car;
