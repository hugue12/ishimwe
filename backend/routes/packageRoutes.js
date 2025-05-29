const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/packageController');
const { authenticateSession } = require('../middleware/authMiddleware');

// All package routes require authentication
router.use(authenticateSession);

// Package routes
router.post('/', PackageController.createPackage);
router.get('/', PackageController.getAllPackages);
router.get('/:packageNumber', PackageController.getPackageByNumber);
router.put('/:packageNumber', PackageController.updatePackage);
router.delete('/:packageNumber', PackageController.deletePackage);

module.exports = router;
