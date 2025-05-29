import { useState, useEffect } from 'react';

const ServicePackageForm = ({ servicePackage, cars, packages, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    packageNumber: '',
    serviceDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (servicePackage) {
      setFormData({
        plateNumber: servicePackage.PlateNumber || '',
        packageNumber: servicePackage.PackageNumber || '',
        serviceDate: servicePackage.ServiceDate ? servicePackage.ServiceDate.split('T')[0] : ''
      });
    } else {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, serviceDate: today }));
    }
  }, [servicePackage]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error.message || 'Failed to save service record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-white mb-6">
        {servicePackage ? 'Edit Service Record' : 'Add New Service Record'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="plateNumber" className="form-label">
            Car (Plate Number)
          </label>
          <select
            id="plateNumber"
            name="plateNumber"
            required
            className="form-input w-full"
            value={formData.plateNumber}
            onChange={handleChange}
          >
            <option value="">Select a car</option>
            {cars.map(car => (
              <option key={car.PlateNumber} value={car.PlateNumber}>
                {car.PlateNumber} - {car.CarType} ({car.DriverName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="packageNumber" className="form-label">
            Service Package
          </label>
          <select
            id="packageNumber"
            name="packageNumber"
            required
            className="form-input w-full"
            value={formData.packageNumber}
            onChange={handleChange}
          >
            <option value="">Select a package</option>
            {packages.map(pkg => (
              <option key={pkg.PackageNumber} value={pkg.PackageNumber}>
                {pkg.PackageName} - {pkg.PackagePrice} RWF
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="serviceDate" className="form-label">
            Service Date
          </label>
          <input
            id="serviceDate"
            name="serviceDate"
            type="date"
            required
            className="form-input w-full"
            value={formData.serviceDate}
            onChange={handleChange}
          />
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
            {loading ? 'Saving...' : (servicePackage ? 'Update Service' : 'Add Service')}
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

export default ServicePackageForm;
