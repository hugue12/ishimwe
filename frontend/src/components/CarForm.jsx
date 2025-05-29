import { useState, useEffect } from 'react';

const CarForm = ({ car, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    carType: '',
    carSize: '',
    driverName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (car) {
      setFormData({
        plateNumber: car.PlateNumber || '',
        carType: car.CarType || '',
        carSize: car.CarSize || '',
        driverName: car.DriverName || '',
        phoneNumber: car.PhoneNumber || ''
      });
    }
  }, [car]);

  // Validation functions
  const validatePlateNumber = (plateNumber) => {
    if (!plateNumber.trim()) {
      return 'Plate number is required';
    }
    // Rwanda plate number format: 3 letters + 3 digits + 1 letter (e.g., RAB 123A)
    const plateRegex = /^[A-Z]{3}\s?\d{3}[A-Z]$/i;
    if (!plateRegex.test(plateNumber.trim())) {
      return 'Invalid plate number format. Use format: ABC 123D';
    }
    return '';
  };

  const validateDriverName = (name) => {
    if (!name.trim()) {
      return 'Driver name is required';
    }
    if (name.trim().length < 2) {
      return 'Driver name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Driver name must be less than 50 characters';
    }
    // Only allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(name.trim())) {
      return 'Driver name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  };

  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');

    // Rwanda phone number formats: +250XXXXXXXXX, 250XXXXXXXXX, 07XXXXXXXX, 78XXXXXXX, etc.
    if (cleanPhone.length === 12 && cleanPhone.startsWith('250')) {
      // Format: 250XXXXXXXXX
      return '';
    } else if (cleanPhone.length === 10 && (cleanPhone.startsWith('07') || cleanPhone.startsWith('78') || cleanPhone.startsWith('79'))) {
      // Format: 07XXXXXXXX, 78XXXXXXX, 79XXXXXXX
      return '';
    } else if (cleanPhone.length === 9 && (cleanPhone.startsWith('7') || cleanPhone.startsWith('8'))) {
      // Format: 7XXXXXXXX, 8XXXXXXXX
      return '';
    } else {
      return 'Invalid phone number. Use Rwanda format: +250788123456 or 0788123456';
    }
  };

  const validateForm = () => {
    const errors = {};

    errors.plateNumber = validatePlateNumber(formData.plateNumber);
    errors.driverName = validateDriverName(formData.driverName);
    errors.phoneNumber = validatePhoneNumber(formData.phoneNumber);

    if (!formData.carType) {
      errors.carType = 'Car type is required';
    }

    if (!formData.carSize) {
      errors.carSize = 'Car size is required';
    }

    // Remove empty error messages
    Object.keys(errors).forEach(key => {
      if (!errors[key]) {
        delete errors[key];
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      setError('Please fix the validation errors below');
      return;
    }

    try {
      // Format plate number consistently (uppercase with space)
      const formattedData = {
        ...formData,
        plateNumber: formData.plateNumber.trim().toUpperCase().replace(/\s+/g, ' '),
        driverName: formData.driverName.trim(),
        phoneNumber: formData.phoneNumber.trim()
      };

      await onSubmit(formattedData);
    } catch (error) {
      setError(error.message || 'Failed to save car');
    } finally {
      setLoading(false);
    }
  };

  const carTypes = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Van', 'Coupe', 'Convertible'];
  const carSizes = ['Small', 'Medium', 'Large'];

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-white mb-6">
        {car ? 'Edit Car' : 'Add New Car'}
      </h3>

      <div className="bg-dark-700 border border-dark-600 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Input Guidelines:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• <strong>Plate Number:</strong> Rwanda format (e.g., RAB 123A)</li>
          <li>• <strong>Driver Name:</strong> Full name, letters only (2-50 characters)</li>
          <li>• <strong>Phone Number:</strong> Rwanda format (+250788123456 or 0788123456)</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="plateNumber" className="form-label">
            Plate Number *
          </label>
          <input
            id="plateNumber"
            name="plateNumber"
            type="text"
            required
            className={`form-input w-full ${validationErrors.plateNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="e.g., RAB 123A"
            value={formData.plateNumber}
            onChange={handleChange}
            disabled={!!car} // Disable editing plate number for existing cars
          />
          {validationErrors.plateNumber && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.plateNumber}</p>
          )}
        </div>

        <div>
          <label htmlFor="carType" className="form-label">
            Car Type *
          </label>
          <select
            id="carType"
            name="carType"
            required
            className={`form-input w-full ${validationErrors.carType ? 'border-red-500 focus:ring-red-500' : ''}`}
            value={formData.carType}
            onChange={handleChange}
          >
            <option value="">Select car type</option>
            {carTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {validationErrors.carType && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.carType}</p>
          )}
        </div>

        <div>
          <label htmlFor="carSize" className="form-label">
            Car Size *
          </label>
          <select
            id="carSize"
            name="carSize"
            required
            className={`form-input w-full ${validationErrors.carSize ? 'border-red-500 focus:ring-red-500' : ''}`}
            value={formData.carSize}
            onChange={handleChange}
          >
            <option value="">Select car size</option>
            {carSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          {validationErrors.carSize && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.carSize}</p>
          )}
        </div>

        <div>
          <label htmlFor="driverName" className="form-label">
            Driver Name *
          </label>
          <input
            id="driverName"
            name="driverName"
            type="text"
            required
            className={`form-input w-full ${validationErrors.driverName ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter driver's full name"
            value={formData.driverName}
            onChange={handleChange}
          />
          {validationErrors.driverName && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.driverName}</p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="form-label">
            Phone Number *
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            className={`form-input w-full ${validationErrors.phoneNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="e.g., +250 788 123 456"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          {validationErrors.phoneNumber && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.phoneNumber}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Saving...' : (car ? 'Update Car' : 'Add Car')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarForm;
