import { useState } from 'react';

const Report = ({ payments, onGenerateBill }) => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filteredPayments, setFilteredPayments] = useState(payments);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setFilteredPayments(payments);
      return;
    }

    const filtered = payments.filter(payment => {
      const paymentDate = new Date(payment.PaymentDate);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return paymentDate >= start && paymentDate <= end;
    });

    setFilteredPayments(filtered);
  };

  const handleReset = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilteredPayments(payments);
  };

  const getTotalAmount = () => {
    return filteredPayments.reduce((total, payment) => total + parseFloat(payment.AmountPaid), 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Daily Reports Filter</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="startDate" className="form-label">
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              className="form-input w-full"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="form-label">
              End Date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              className="form-input w-full"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-2 flex flex-col sm:flex-row items-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={handleFilter}
              className="btn-primary w-full sm:flex-1"
            >
              Filter
            </button>
            <button
              onClick={handleReset}
              className="btn-secondary w-full sm:flex-1"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card">
          <h4 className="text-lg font-medium text-white mb-2">Total Records</h4>
          <p className="text-3xl font-bold text-primary-400">{filteredPayments.length}</p>
        </div>
        <div className="card">
          <h4 className="text-lg font-medium text-white mb-2">Total Amount</h4>
          <p className="text-3xl font-bold text-primary-400">{formatCurrency(getTotalAmount())}</p>
        </div>
        <div className="card">
          <h4 className="text-lg font-medium text-white mb-2">Average Amount</h4>
          <p className="text-3xl font-bold text-primary-400">
            {filteredPayments.length > 0 ? formatCurrency(getTotalAmount() / filteredPayments.length) : formatCurrency(0)}
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Payment Reports</h3>
          <button
            onClick={() => window.print()}
            className="btn-secondary"
          >
            Print Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-600">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Plate Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Package Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-dark-800 divide-y divide-dark-600">
              {filteredPayments.map((payment) => (
                <tr key={payment.PaymentNumber} className="hover:bg-dark-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {payment.PlateNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {payment.PackageName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {payment.PackageDescription}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-400 font-medium">
                    {formatCurrency(payment.AmountPaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(payment.PaymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onGenerateBill(payment.PaymentNumber)}
                      className="text-primary-400 hover:text-primary-300 font-medium"
                    >
                      Generate Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No payment records found for the selected date range.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
