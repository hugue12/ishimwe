import { useState, useEffect } from 'react';
import { packagesAPI } from '../services/api';
import PackageForm from '../components/PackageForm';

const PackagePage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);


  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packagesAPI.getAll();
      setPackages(response.data || []);
    } catch (error) {
      setError('Failed to fetch packages');
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = async (packageData) => {
    try {
      await packagesAPI.create(packageData);
      await fetchPackages();
      setShowForm(false);
      setError('');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add package');
    }
  };

  const handleEditPackage = async (packageData) => {
    try {
      await packagesAPI.update(editingPackage.PackageNumber, packageData);
      await fetchPackages();
      setShowForm(false);
      setEditingPackage(null);
      setError('');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update package');
    }
  };

  const handleDeletePackage = async (packageNumber) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await packagesAPI.delete(packageNumber);
        await fetchPackages();
        setError('');
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete package');
      }
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPackage(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredPackages = packages;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Package Management</h1>
        <p className="text-gray-400">Manage car washing service packages and pricing</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showForm ? (
        <PackageForm
          package={editingPackage}
          onSubmit={editingPackage ? handleEditPackage : handleAddPackage}
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
              Add New Package
            </button>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredPackages.map((pkg) => (
              <div key={pkg.PackageNumber} className="card hover:border-primary-500 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-0">{pkg.PackageName}</h3>
                  <span className="text-xl sm:text-2xl font-bold text-primary-400">
                    {formatCurrency(pkg.PackagePrice)}
                  </span>
                </div>

                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[3rem]">
                  {pkg.PackageDescription}
                </p>

               
              </div>
            ))}
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No packages available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PackagePage;
