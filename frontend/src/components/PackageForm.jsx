import { useState, useEffect } from 'react';

const PackageForm = ({ package: packageData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    packageName: '',
    packageDescription: '',
    packagePrice: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (packageData) {
      setFormData({
        packageName: packageData.PackageName || '',
        packageDescription: packageData.PackageDescription || '',
        packagePrice: packageData.PackagePrice || ''
      });
    }
  }, [packageData]);

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
      setError(error.message || 'Failed to save package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-white mb-6">
        {packageData ? 'Edit Package' : 'Add New Package'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="packageName" className="form-label">
            Package Name
          </label>
          <input
            id="packageName"
            name="packageName"
            type="text"
            required
            className="form-input w-full"
            placeholder="e.g., Basic wash, Premium wash"
            value={formData.packageName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="packageDescription" className="form-label">
            Package Description
          </label>
          <textarea
            id="packageDescription"
            name="packageDescription"
            required
            rows={3}
            className="form-input w-full"
            placeholder="Describe what's included in this package"
            value={formData.packageDescription}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="packagePrice" className="form-label">
            Package Price (RWF)
          </label>
          <input
            id="packagePrice"
            name="packagePrice"
            type="number"
            min="0"
            step="0.01"
            required
            className="form-input w-full"
            placeholder="e.g., 5000"
            value={formData.packagePrice}
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
            {loading ? 'Saving...' : (packageData ? 'Update Package' : 'Add Package')}
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

export default PackageForm;
