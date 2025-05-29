// Test script to check car deletion API
const axios = require('axios');

async function testCarDeletion() {
  try {
    // First, let's get all cars to see what's available
    console.log('Getting all cars...');
    const carsResponse = await axios.get('http://localhost:3002/api/cars', {
      headers: {
        'Cookie': 'session=test' // You might need to adjust this based on your session
      }
    });
    
    console.log('Cars found:', carsResponse.data.data.length);
    
    if (carsResponse.data.data.length > 0) {
      const firstCar = carsResponse.data.data[0];
      console.log('First car:', firstCar);
      
      // Try to delete the first car
      console.log('Attempting to delete car:', firstCar.PlateNumber);
      const deleteResponse = await axios.delete(`http://localhost:3002/api/cars/${encodeURIComponent(firstCar.PlateNumber)}`, {
        headers: {
          'Cookie': 'session=test'
        }
      });
      
      console.log('Delete response:', deleteResponse.data);
    } else {
      console.log('No cars found to delete');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testCarDeletion();
