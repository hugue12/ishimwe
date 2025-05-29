









const handleDeleteCar = async (plateNumber) => {
  if (window.confirm('Are you sure you want to delete this car?')) {
    try {
      console.log('Attempting to delete car with plate number:', plateNumber);
      console.log('Type of plateNumber:', typeof plateNumber);
      
      // Make sure plateNumber is not undefined or null
      if (!plateNumber) {
        throw new Error('Plate number is required for deletion');
      }
      
      const response = await carsAPI.delete(plateNumber);
      console.log('Delete response:', response);
      
      // Check if the response indicates success
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Delete operation failed');
      }
      
      await fetchCars();
      setError('');
      
      // Show success message
      console.log('Car deleted successfully');
      
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
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    }


  }
};