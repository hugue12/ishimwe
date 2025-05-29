const express = require('express');
const router = express.Router();
const ServicePackageController = require('../controllers/servicePackageController');
const { authenticateSession } = require('../middleware/authMiddleware');

// All service package routes require authentication
router.use(authenticateSession);

// Service package routes
router.post('/', ServicePackageController.createServicePackage);
router.get('/', ServicePackageController.getAllServicePackages);
router.get('/date-range', ServicePackageController.getServicePackagesByDateRange);
router.get('/:recordNumber', ServicePackageController.getServicePackageByRecordNumber);
router.put('/:recordNumber', ServicePackageController.updateServicePackage);
router.delete('/:recordNumber', ServicePackageController.deleteServicePackage);

module.exports = router;
