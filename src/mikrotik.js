const RosApi = require('routeros-client').RouterOSAPI;
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
      const connection = new RosApi({
        host: host || this.config.MIKROTIK_HOST,
        port: port || this.config.MIKROTIK_PORT,
        user: user || this.config.MIKROTIK_USER,
        password: pass || this.config.MIKROTIK_PASS,
        timeout: this.config.CONNECTION_TIMEOUT
      });

      await connection.connect();
      this.connection = connection;
      logger.info(`Connected to MikroTik at ${host}:${port}`);
      return true;
    } catch (error) {
      logger.error('Connection error:', error.message);
      throw new Error(`Failed to connect to MikroTik: ${error.message}`);
    }
  }

  async executeCommand(command) {
    if (!this.connection) {
      throw new Error('Not connected to MikroTik');
    }

    try {
      logger.info(`Executing command: ${command}`);
      const result = await this.connection.write(command);
      return result;
    } catch (error) {
      logger.error('Command execution error:', error.message);
      throw new Error(`Command execution failed: ${error.message}`);
    } finally {
      // Close connection after command execution
      try {
        await this.connection.close();
        logger.info('Connection closed');
      } catch (error) {
        logger.error('Error closing connection:', error.message);
      }
    }
  }
}

module.exports = MikrotikClient;
