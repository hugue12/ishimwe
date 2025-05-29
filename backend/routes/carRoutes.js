const express = require('express');
const router = express.Router();
const CarController = require('../controllers/carController');
const { authenticateSession } = require('../middleware/authMiddleware');

// All car routes require authentication
router.use(authenticateSession);

// Car routes
router.post('/', CarController.createCar);
router.get('/', CarController.getAllCars);
router.get('/:plateNumber', CarController.getCarByPlateNumber);
router.put('/:plateNumber', CarController.updateCar);
router.delete('/:plateNumber', CarController.deleteCar);

module.exports = router;
