import { useState, useEffect } from 'react';
import { carsAPI } from '../services/api';
import CarForm from '../components/CarForm';

const CarPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);


  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carsAPI.getAll();
      setCars(response.data || []);
    } catch (error) {
      setError('Failed to fetch cars');
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async (carData) => {
    try {
      await carsAPI.create(carData);
      await fetchCars();
      setShowForm(false);
      setError('');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add car');
    }
  };

  const handleEditCar = async (carData) => {
    try {
      await carsAPI.update(editingCar.PlateNumber, carData);
      await fetchCars();
      setShowForm(false);
      setEditingCar(null);
      setError('');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update car');
    }
  };

  const handleDeleteCar = async (plateNumber) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        console.log('Attempting to delete car:', plateNumber);
        const response = await carsAPI.delete(plateNumber);
        console.log('Delete response:', response);
        await fetchCars();
        setError('');
      } catch (error) {
        console.error('Delete car error:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);

        let errorMessage = 'Failed to delete car';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication required. Please login again.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Car not found.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
      }
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCar(null);
  };

  const filteredCars = cars;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading cars...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Car Management</h1>
        <p className="text-gray-400">Manage car information and driver details</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showForm ? (
        <CarForm
          car={editingCar}
          onSubmit={editingCar ? handleEditCar : handleAddCar}
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
              Add New Car
            </button>
          </div>

          {/* Cars Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-600 text-sm sm:text-base">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Plate Number
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      Car Type
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Size
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Driver Name
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      Phone Number
                    </th>
                  
                  </tr>
                </thead>
                <tbody className="bg-dark-800 divide-y divide-dark-600">
                  {filteredCars.map((car) => (
                    <tr key={car.PlateNumber} className="hover:bg-dark-700">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {car.PlateNumber}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                        {car.CarType}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                        {car.CarSize}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div>
                          <div className="font-medium">{car.DriverName}</div>
                          <div className="text-xs text-gray-400 sm:hidden">{car.CarType}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden lg:table-cell">
                        {car.PhoneNumber}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                       
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCars.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No cars registered yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarPage;
