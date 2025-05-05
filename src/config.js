require('dotenv').config();

const config = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  
  // Default MikroTik connection parameters (optional)
  MIKROTIK_HOST: process.env.MIKROTIK_HOST,
  MIKROTIK_PORT: process.env.MIKROTIK_PORT || 8728,
  MIKROTIK_USER: process.env.MIKROTIK_USER,
  MIKROTIK_PASS: process.env.MIKROTIK_PASS,

  // Timeouts (in milliseconds)
  CONNECTION_TIMEOUT: parseInt(process.env.CONNECTION_TIMEOUT) || 10000,
  COMMAND_TIMEOUT: parseInt(process.env.COMMAND_TIMEOUT) || 30000
};

module.exports = config;
