const Package = require('../models/packageModel');

class PackageController {
  // Create new package
  static async createPackage(req, res) {
    try {
      const { packageName, packageDescription, packagePrice } = req.body;

      // Validation
      if (!packageName || !packageDescription || !packagePrice) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      if (packagePrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Package price must be greater than 0'
        });
      }

      const result = await Package.create({
        packageName,
        packageDescription,
        packagePrice
      });

      res.status(201).json({
        success: true,
        message: 'Package created successfully',
        data: result
      });
    } catch (error) {
      console.error('Create package error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all packages
  static async getAllPackages(req, res) {
    try {
      const packages = await Package.findAll();
      res.json({
        success: true,
        data: packages
      });
    } catch (error) {
      console.error('Get all packages error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get package by number
  static async getPackageByNumber(req, res) {
    try {
      const { packageNumber } = req.params;
      const packageData = await Package.findByNumber(packageNumber);

      if (!packageData) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      res.json({
        success: true,
        data: packageData
      });
    } catch (error) {
      console.error('Get package error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update package
  static async updatePackage(req, res) {
    try {
      const { packageNumber } = req.params;
      const { packageName, packageDescription, packagePrice } = req.body;

      // Validation
      if (!packageName || !packageDescription || !packagePrice) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      if (packagePrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Package price must be greater than 0'
        });
      }

      const updated = await Package.update(packageNumber, {
        packageName,
        packageDescription,
        packagePrice
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      res.json({
        success: true,
        message: 'Package updated successfully'
      });
    } catch (error) {
      console.error('Update package error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete package
  static async deletePackage(req, res) {
    try {
      const { packageNumber } = req.params;

      // Check if package exists first
      const existingPackage = await Package.findByNumber(packageNumber);
      if (!existingPackage) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      const deleted = await Package.delete(packageNumber);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      res.json({
        success: true,
        message: 'Package and all related records deleted successfully'
      });
    } catch (error) {
      console.error('Delete package error:', error);

      // Handle specific foreign key constraint errors
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete package: it has related service records. Please delete related services first.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete package. Please try again.'
      });
    }
  }
}

module.exports = PackageController;
