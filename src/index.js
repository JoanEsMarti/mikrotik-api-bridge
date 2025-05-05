const express = require('express');
const winston = require('winston');
const config = require('./config');
const MikrotikClient = require('./mikrotik');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

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

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error({
    message: 'Server error',
    error: err.message,
    stack: err.stack
  });
  res.status(500).json({
    success: false,
    data: 'Internal server error'
  });
};

// Request logging middleware
app.use((req, res, next) => {
  logger.info({
    message: 'Incoming request',
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
  next();
});

// JSON parsing with error handling
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        data: 'Invalid JSON payload'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

// Add response time header
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      message: 'Request completed',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  next();
});

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

// Register error handler after all routes
app.use(errorHandler);

// Start the server
try {
  const server = app.listen(config.PORT, '0.0.0.0', () => {
    logger.info({
      message: 'Server started successfully',
      port: config.PORT,
      address: server.address(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  server.on('error', (error) => {
    logger.error('Server error:', error);
    process.exit(1);
  });

  // Log all available network interfaces
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  logger.info({
    message: 'Network interfaces',
    interfaces: networkInterfaces
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
} catch (error) {
  logger.error('Failed to start server:', error);
  process.exit(1);
}
