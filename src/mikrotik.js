const RosApi = require('routeros').RouterOSAPI;
const winston = require('winston');

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

class MikrotikClient {
  constructor(config) {
    this.config = config;
    this.connection = null;
  }

  async connect(host, port, user, pass) {
    try {
      const connection = new RouterOS({
        host: host || this.config.MIKROTIK_HOST,
        port: port || this.config.MIKROTIK_PORT,
        user: user || this.config.MIKROTIK_USER,
        password: pass || this.config.MIKROTIK_PASS,
        timeout: this.config.CONNECTION_TIMEOUT
      });

      await new Promise((resolve, reject) => {
        connection.connect((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      this.connection = connection;
      logger.info(`Connected to MikroTik at ${host}:${port}`);
      return true;
    } catch (error) {
      logger.error('Connection error:', {
        error: error.message,
        stack: error.stack,
        host: host || this.config.MIKROTIK_HOST,
        port: port || this.config.MIKROTIK_PORT
      });
      throw new Error(`Failed to connect to MikroTik at ${host}:${port} - ${error.message}`);
    }
  }

  async executeCommand(command) {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      logger.info('Executing command:', {
        command
      });

      // Parse command string into segments
      const segments = command.split('/').filter(Boolean);
      const commandPath = segments.slice(0, -1).join('/');
      const action = segments[segments.length - 1];

      logger.info('Parsed command:', {
        segments,
        commandPath,
        action
      });

      // Execute command
      const result = await new Promise((resolve, reject) => {
        this.connection.write(command, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });

      logger.info('Command executed successfully:', {
        command,
        resultType: typeof result,
        resultLength: Array.isArray(result) ? result.length : null
      });

      return result;
    } catch (error) {
      logger.error('Command execution error:', {
        command,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Command execution failed for '${command}': ${error.message}`);
    } finally {
      // Close connection after command execution
      try {
        this.connection.close();
        logger.info('Connection closed');
      } catch (error) {
        logger.error('Error closing connection:', error.message);
      }
    }
  }
}

module.exports = MikrotikClient;
