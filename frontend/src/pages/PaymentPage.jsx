import { useState, useEffect } from 'react';
import { paymentsAPI, servicePackagesAPI } from '../services/api';
import PaymentForm from '../components/PaymentForm';

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [servicePackages, setServicePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsResponse, servicesResponse] = await Promise.all([
        paymentsAPI.getAll(),
        servicePackagesAPI.getAll()
      ]);

      setPayments(paymentsResponse.data || []);
      setServicePackages(servicesResponse.data || []);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      await paymentsAPI.create(paymentData);
      await fetchData();
      setShowForm(false);
      setError('');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add payment');
    }
  };

  const handleEditPayment = async (paymentData) => {
    try {
      await paymentsAPI.update(editingPayment.PaymentNumber, paymentData);
      await fetchData();
      setShowForm(false);
      setEditingPayment(null);
      setError('');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleDeletePayment = async (paymentNumber) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await paymentsAPI.delete(paymentNumber);
        await fetchData();
        setError('');
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete payment');
      }
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPayment(null);
  };

  const handleGenerateBill = async (paymentNumber) => {
    try {
      const response = await paymentsAPI.generateBill(paymentNumber);
      const bill = response.data;

      // Create a new window for the bill
      const billWindow = window.open('', '_blank');
      billWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>SmartPark Bill - ${bill.billNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }

            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              color: black;
              font-size: 12px;
              line-height: 1.4;
            }

            .container {
              max-width: 100%;
              margin: 0 auto;
            }

            .header {
              text-align: center;
              margin-bottom: 25px;
              border-bottom: 2px solid #22c55e;
              padding-bottom: 15px;
            }

            .header h1 {
              margin: 0 0 5px 0;
              font-size: 24px;
              color: #22c55e;
            }

            .header h2 {
              margin: 0;
              font-size: 16px;
              color: #666;
            }

            .bill-info {
              margin-bottom: 20px;
              background: #f9fafb;
              padding: 12px;
              border-radius: 6px;
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 15px;
            }

            .section {
              margin-bottom: 15px;
              padding: 12px;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              break-inside: avoid;
            }

            .section h3 {
              margin: 0 0 10px 0;
              color: #22c55e;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
              font-size: 14px;
            }

            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }

            .total {
              font-weight: bold;
              font-size: 18px;
              color: #22c55e;
              text-align: center;
              background: #f0fdf4;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border: 2px solid #22c55e;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 11px;
            }

            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
              vertical-align: top;
            }

            th {
              background: #f9fafb;
              font-weight: bold;
              font-size: 10px;
              text-transform: uppercase;
            }

            .signatures {
              margin-top: 40px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 50px;
              page-break-inside: avoid;
            }

            .signature-box {
              text-align: center;
            }

            .signature-line {
              border-bottom: 1px solid #000;
              height: 40px;
              margin-bottom: 5px;
            }

            .signature-label {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 5px;
            }

            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 10px;
              page-break-inside: avoid;
            }

            @media print {
              body {
                font-size: 11px;
              }
              .container {
                max-width: none;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SmartPark CWSMS</h1>
              <h2>Car Washing Service Bill</h2>
            </div>

            <div class="bill-info">
              <div><strong>Bill Number:</strong><br>${bill.billNumber}</div>
              <div><strong>Issue Date:</strong><br>${new Date(bill.date).toLocaleDateString()}</div>
              <div><strong>Payment #:</strong><br>#${bill.payment.paymentNumber}</div>
            </div>

            <div class="info-grid">
              <div class="section">
                <h3>Customer Information</h3>
                <p><strong>Driver Name:</strong> ${bill.customer.name}</p>
                <p><strong>Phone Number:</strong> ${bill.customer.phone}</p>
              </div>

              <div class="section">
                <h3>Vehicle Information</h3>
                <p><strong>Plate Number:</strong> ${bill.car.plateNumber}</p>
                <p><strong>Car Type:</strong> ${bill.car.type}</p>
                <p><strong>Car Size:</strong> ${bill.car.size}</p>
              </div>
            </div>

            <div class="section">
              <h3>Service Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>Service Package</th>
                    <th>Description</th>
                    <th>Service Date</th>
                    <th>Package Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${bill.service.packageName}</td>
                    <td>${bill.service.description}</td>
                    <td>${new Date(bill.service.serviceDate).toLocaleDateString()}</td>
                    <td>${bill.service.price} RWF</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <h3>Payment Information</h3>
              <div class="info-grid">
                <p><strong>Amount Paid:</strong> ${bill.payment.amountPaid} RWF</p>
                <p><strong>Payment Date:</strong> ${new Date(bill.payment.paymentDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div class="total">
              <p>Total Amount: ${bill.total} RWF</p>
            </div>

            <div class="signatures">
              <div class="signature-box">
                <div class="signature-label">Customer Signature</div>
                <div class="signature-line"></div>
                <p style="margin: 5px 0; font-size: 10px;">Name: ${bill.customer.name}</p>
                <p style="margin: 5px 0; font-size: 10px;">Date: _______________</p>
              </div>

              <div class="signature-box">
                <div class="signature-label">Service Provider</div>
                <div class="signature-line"></div>
                <p style="margin: 5px 0; font-size: 10px;">SmartPark Representative</p>
                <p style="margin: 5px 0; font-size: 10px;">Date: _______________</p>
              </div>
            </div>

            <div class="footer">
              <p><strong>Thank you for choosing SmartPark!</strong></p>
              <p>Located in Rubavu District, Western Province, Rwanda</p>
              <p>Contact: +250 788 123 456 | Email: info@smartpark.rw</p>
              <p style="margin-top: 10px; font-size: 9px;">Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `);
      billWindow.document.close();
    } catch (error) {
      setError('Failed to generate bill');
    }
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

  const filteredPayments = payments;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Payment Management</h1>
        <p className="text-gray-400">Manage payments and generate bills</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showForm ? (
        <PaymentForm
          payment={editingPayment}
          servicePackages={servicePackages}
          onSubmit={editingPayment ? handleEditPayment : handleAddPayment}
          onCancel={handleCancel}
        />
      ) : (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add New Payment
            </button>
          </div>

          {/* Payments Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-600 text-sm sm:text-base">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Payment #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Plate Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Package
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
                        #{payment.PaymentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {payment.PlateNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {payment.DriverName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {payment.PackageName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-400 font-medium">
                        {formatCurrency(payment.AmountPaid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(payment.PaymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleGenerateBill(payment.PaymentNumber)}
                          className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                          Bill
                        </button>
                        <button
                          onClick={() => handleEdit(payment)}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePayment(payment.PaymentNumber)}
                          className="text-red-400 hover:text-red-300 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPayments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No payments recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
