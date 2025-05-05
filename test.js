const axios = require('axios');

const testMikrotikAPI = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/mikrotik', {
      user: 'admin',
      pass: 'password',
      host: '192.168.88.1',
      command: '/system/resource/print'
    });
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

testMikrotikAPI();
