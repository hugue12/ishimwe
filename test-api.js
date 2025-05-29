const axios = require('axios');

// Test API endpoints
async function testAPI() {
  const baseURL = 'http://localhost:3002/api';
  
  try {
    console.log('Testing API endpoints...\n');
    
    // Test 1: Get all cars
    console.log('1. Getting all cars...');
    const carsResponse = await axios.get(`${baseURL}/cars`);
    console.log('Cars found:', carsResponse.data.data?.length || 0);
    
    if (carsResponse.data.data && carsResponse.data.data.length > 0) {
      const firstCar = carsResponse.data.data[0];
      console.log('First car:', firstCar.PlateNumber);
      
      // Test 2: Try to delete the first car
      console.log('\n2. Attempting to delete car:', firstCar.PlateNumber);
      try {
        const deleteResponse = await axios.delete(`${baseURL}/cars/${encodeURIComponent(firstCar.PlateNumber)}`);
        console.log('Delete successful:', deleteResponse.data);
      } catch (deleteError) {
        console.log('Delete failed:', deleteError.response?.data || deleteError.message);
      }
    }
    
    // Test 3: Get all service packages
    console.log('\n3. Getting all service packages...');
    const servicesResponse = await axios.get(`${baseURL}/service-packages`);
    console.log('Services found:', servicesResponse.data.data?.length || 0);
    
    if (servicesResponse.data.data && servicesResponse.data.data.length > 0) {
      const firstService = servicesResponse.data.data[0];
      console.log('First service:', firstService.RecordNumber);
      
      // Test 4: Try to delete the first service
      console.log('\n4. Attempting to delete service:', firstService.RecordNumber);
      try {
        const deleteResponse = await axios.delete(`${baseURL}/service-packages/${firstService.RecordNumber}`);
        console.log('Delete successful:', deleteResponse.data);
      } catch (deleteError) {
        console.log('Delete failed:', deleteError.response?.data || deleteError.message);
      }
    }
    
  } catch (error) {
    console.error('API test error:', error.message);
  }
}

testAPI();
