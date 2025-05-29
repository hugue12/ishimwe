import { useState, useEffect } from 'react';
import { servicePackagesAPI, carsAPI, packagesAPI } from '../services/api';
import ServicePackageForm from '../components/ServicePackageForm';

const ServicePackagePage = () => {
  const [servicePackages, setServicePackages] = useState([]);
  const [cars, setCars] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesResponse, carsResponse, packagesResponse] = await Promise.all([
        servicePackagesAPI.getAll(),
        carsAPI.getAll(),
        packagesAPI.getAll()
      ]);

      setServicePackages(servicesResponse.data || []);
      setCars(carsResponse.data || []);
      setPackages(packagesResponse.data || []);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (serviceData) => {
    try {
      await servicePackagesAPI.create(serviceData);
      await fetchData();
      setShowForm(false);
      setError('');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add service record');
    }
  };

  const handleEditService = async (serviceData) => {
    try {
      await servicePackagesAPI.update(editingService.RecordNumber, serviceData);
      await fetchData();
      setShowForm(false);
      setEditingService(null);
      setError('');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update service record');
    }
  };

  const handleDeleteService = async (recordNumber) => {
    if (window.confirm('Are you sure you want to delete this service record?')) {
      try {
        await servicePackagesAPI.delete(recordNumber);
        await fetchData();
        setError('');
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete service record');
      }
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
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

  const filteredServices = servicePackages;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading service records...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Service Package Management</h1>
        <p className="text-gray-400">Manage car washing service records</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showForm ? (
        <ServicePackageForm
          servicePackage={editingService}
          cars={cars}
          packages={packages}
          onSubmit={editingService ? handleEditService : handleAddService}
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
              Add New Service Record
            </button>
          </div>

          {/* Service Records Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-600 text-sm sm:text-base">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Record #
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
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Service Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-dark-800 divide-y divide-dark-600">
                  {filteredServices.map((service) => (
                    <tr key={service.RecordNumber} className="hover:bg-dark-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        #{service.RecordNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {service.PlateNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {service.DriverName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {service.PackageName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-400 font-medium">
                        {formatCurrency(service.PackagePrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(service.ServiceDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.RecordNumber)}
                          className="text-red-400 hover:text-red-300 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredServices.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No service records yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePackagePage;
