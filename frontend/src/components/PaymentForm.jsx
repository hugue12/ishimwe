import { useState, useEffect } from 'react';

const PaymentForm = ({ payment, servicePackages, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    recordNumber: '',
    amountPaid: '',
    paymentDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (payment) {
      setFormData({
        recordNumber: payment.RecordNumber || '',
        amountPaid: payment.AmountPaid || '',
        paymentDate: payment.PaymentDate ? payment.PaymentDate.split('T')[0] : ''
      });
    } else {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, paymentDate: today }));
    }
  }, [payment]);

  useEffect(() => {
    if (formData.recordNumber) {
      const service = servicePackages.find(sp => sp.RecordNumber == formData.recordNumber);
      setSelectedService(service);
      if (service && !formData.amountPaid) {
        setFormData(prev => ({ ...prev, amountPaid: service.PackagePrice }));
      }
    } else {
      setSelectedService(null);
    }
  }, [formData.recordNumber, servicePackages]);

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
      setError(error.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-white mb-6">
        {payment ? 'Edit Payment' : 'Add New Payment'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recordNumber" className="form-label">
            Service Record
          </label>
          <select
            id="recordNumber"
            name="recordNumber"
            required
            className="form-input w-full"
            value={formData.recordNumber}
            onChange={handleChange}
          >
            <option value="">Select a service record</option>
            {servicePackages.map(service => (
              <option key={service.RecordNumber} value={service.RecordNumber}>
                #{service.RecordNumber} - {service.PlateNumber} - {service.PackageName} ({service.ServiceDate})
              </option>
            ))}
          </select>
        </div>

        {selectedService && (
          <div className="bg-dark-700 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-white mb-2">Service Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Car:</span>
                <span className="text-white ml-2">{selectedService.PlateNumber}</span>
              </div>
              <div>
                <span className="text-gray-400">Driver:</span>
                <span className="text-white ml-2">{selectedService.DriverName}</span>
              </div>
              <div>
                <span className="text-gray-400">Package:</span>
                <span className="text-white ml-2">{selectedService.PackageName}</span>
              </div>
              <div>
                <span className="text-gray-400">Price:</span>
                <span className="text-white ml-2">{selectedService.PackagePrice} RWF</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="amountPaid" className="form-label">
            Amount Paid (RWF)
          </label>
          <input
            id="amountPaid"
            name="amountPaid"
            type="number"
            min="0"
            step="0.01"
            required
            className="form-input w-full"
            placeholder="Enter amount paid"
            value={formData.amountPaid}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="paymentDate" className="form-label">
            Payment Date
          </label>
          <input
            id="paymentDate"
            name="paymentDate"
            type="date"
            required
            className="form-input w-full"
            value={formData.paymentDate}
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
            {loading ? 'Saving...' : (payment ? 'Update Payment' : 'Add Payment')}
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

export default PaymentForm;
