const express = require('express');
const winston = require('winston');
const config = require('./config');
const MikrotikClient = require('./mikrotik');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Main API endpoint
app.post('/api/mikrotik', async (req, res) => {
  const { user, pass, host, port, command } = req.body;

  // Validate required fields
  if (!host || !command) {
    return res.status(400).json({
      success: false,
      data: 'Missing required fields: host and command are mandatory'
    });
  }

  // Create MikroTik client instance
  const mikrotik = new MikrotikClient(config);

  try {
    // Connect to the router
    await mikrotik.connect(host, port, user, pass);

    // Execute the command
    const result = await mikrotik.executeCommand(command);

    // Return successful response
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Request failed:', error.message);
    
    // Return error response
    res.status(500).json({
      success: false,
      data: error.message
    });
  }
});

// Start the server
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
