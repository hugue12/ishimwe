const ServicePackage = require('../models/servicePackageModel');

class ServicePackageController {
  // Create new service record
  static async createServicePackage(req, res) {
    try {
      const { plateNumber, packageNumber, serviceDate } = req.body;

      // Validation
      if (!plateNumber || !packageNumber || !serviceDate) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      const result = await ServicePackage.create({
        plateNumber,
        packageNumber,
        serviceDate
      });

      res.status(201).json({
        success: true,
        message: 'Service record created successfully',
        data: result
      });
    } catch (error) {
      console.error('Create service package error:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          success: false,
          message: 'Invalid plate number or package number'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all service records
  static async getAllServicePackages(req, res) {
    try {
      const servicePackages = await ServicePackage.findAll();
      res.json({
        success: true,
        data: servicePackages
      });
    } catch (error) {
      console.error('Get all service packages error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get service record by record number
  static async getServicePackageByRecordNumber(req, res) {
    try {
      const { recordNumber } = req.params;
      const servicePackage = await ServicePackage.findByRecordNumber(recordNumber);

      if (!servicePackage) {
        return res.status(404).json({
          success: false,
          message: 'Service record not found'
        });
      }

      res.json({
        success: true,
        data: servicePackage
      });
    } catch (error) {
      console.error('Get service package error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update service record
  static async updateServicePackage(req, res) {
    try {
      const { recordNumber } = req.params;
      const { plateNumber, packageNumber, serviceDate } = req.body;

      // Validation
      if (!plateNumber || !packageNumber || !serviceDate) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      const updated = await ServicePackage.update(recordNumber, {
        plateNumber,
        packageNumber,
        serviceDate
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Service record not found'
        });
      }

      res.json({
        success: true,
        message: 'Service record updated successfully'
      });
    } catch (error) {
      console.error('Update service package error:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          success: false,
          message: 'Invalid plate number or package number'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete service record
  static async deleteServicePackage(req, res) {
    try {
      const { recordNumber } = req.params;

      // Check if service record exists first
      const existingRecord = await ServicePackage.findByRecordNumber(recordNumber);
      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          message: 'Service record not found'
        });
      }

      const deleted = await ServicePackage.delete(recordNumber);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Service record not found'
        });
      }

      res.json({
        success: true,
        message: 'Service record and all related payments deleted successfully'
      });
    } catch (error) {
      console.error('Delete service package error:', error);

      // Handle specific foreign key constraint errors
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete service record: it has related payment records. Please delete related payments first.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete service record. Please try again.'
      });
    }
  }

  // Get service records by date range
  static async getServicePackagesByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const servicePackages = await ServicePackage.findByDateRange(startDate, endDate);
      res.json({
        success: true,
        data: servicePackages
      });
    } catch (error) {
      console.error('Get service packages by date range error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = ServicePackageController;
