const Car = require('../models/carModel');

class CarController {
  // Create new car
  static async createCar(req, res) {
    try {
      const { plateNumber, carType, carSize, driverName, phoneNumber } = req.body;

      // Validation
      if (!plateNumber || !carType || !carSize || !driverName || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if car already exists
      const existingCar = await Car.findByPlateNumber(plateNumber);
      if (existingCar) {
        return res.status(409).json({
          success: false,
          message: 'Car with this plate number already exists'
        });
      }

      const result = await Car.create({
        plateNumber,
        carType,
        carSize,
        driverName,
        phoneNumber
      });

      res.status(201).json({
        success: true,
        message: 'Car created successfully',
        data: result
      });
    } catch (error) {
      console.error('Create car error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all cars
  static async getAllCars(req, res) {
    try {
      const cars = await Car.findAll();
      res.json({
        success: true,
        data: cars
      });
    } catch (error) {
      console.error('Get all cars error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get car by plate number
  static async getCarByPlateNumber(req, res) {
    try {
      const { plateNumber: rawPlateNumber } = req.params;
      const plateNumber = decodeURIComponent(rawPlateNumber);
      const car = await Car.findByPlateNumber(plateNumber);

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }

      res.json({
        success: true,
        data: car
      });
    } catch (error) {
      console.error('Get car error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update car
  static async updateCar(req, res) {
    try {
      const { plateNumber: rawPlateNumber } = req.params;
      const plateNumber = decodeURIComponent(rawPlateNumber);
      const { carType, carSize, driverName, phoneNumber } = req.body;

      // Validation
      if (!carType || !carSize || !driverName || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      const updated = await Car.update(plateNumber, {
        carType,
        carSize,
        driverName,
        phoneNumber
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }

      res.json({
        success: true,
        message: 'Car updated successfully'
      });
    } catch (error) {
      console.error('Update car error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete car
  static async deleteCar(req, res) {
    try {
      const { plateNumber: rawPlateNumber } = req.params;
      const plateNumber = decodeURIComponent(rawPlateNumber);
      console.log('Delete car request received for plate number:', plateNumber);
      console.log('Raw plate number from URL:', rawPlateNumber);

      // Check if car exists first
      const existingCar = await Car.findByPlateNumber(plateNumber);
      console.log('Existing car found:', existingCar ? 'Yes' : 'No');

      if (!existingCar) {
        console.log('Car not found, returning 404');
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }

      console.log('Attempting to delete car...');
      const deleted = await Car.delete(plateNumber);
      console.log('Delete operation result:', deleted);

      if (!deleted) {
        console.log('Delete operation returned false');
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }

      console.log('Car deleted successfully');
      res.json({
        success: true,
        message: 'Car and all related records deleted successfully'
      });
    } catch (error) {
      console.error('Delete car error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Handle specific foreign key constraint errors
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete car: it has related service records. Please delete related services first.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete car. Please try again.'
      });
    }
  }
}

module.exports = CarController;
