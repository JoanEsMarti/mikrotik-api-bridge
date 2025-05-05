# MikroTik API Bridge

A HTTP RESTful bridge for MikroTik RouterOS API (compatible with RouterOS 6 and 7) that allows you to send commands to MikroTik devices via HTTP POST requests.

## Features

- HTTP REST API endpoint for executing MikroTik commands
- Support for RouterOS versions 6 and 7
- Configurable via environment variables
- Docker support for easy deployment
- Error handling and logging
- Connection pooling and automatic cleanup

## Installation

### Using Docker (Recommended)

1. Clone this repository:
```bash
git clone https://github.com/yourusername/mikrotik-api-bridge.git
cd mikrotik-api-bridge
```

2. Build and run using Docker Compose:
```bash
docker-compose up -d
```

### Manual Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

## Configuration

The following environment variables can be set (all optional):

- `PORT`: Server port (default: 3000)
- `MIKROTIK_HOST`: Default MikroTik host
- `MIKROTIK_PORT`: Default MikroTik API port (default: 8728)
- `MIKROTIK_USER`: Default username
- `MIKROTIK_PASS`: Default password
- `CONNECTION_TIMEOUT`: Connection timeout in ms (default: 10000)
- `COMMAND_TIMEOUT`: Command execution timeout in ms (default: 30000)

## API Usage

### Endpoint: POST /api/mikrotik

Send commands to a MikroTik device.

#### Request Body

```json
{
  "user": "admin",
  "pass": "password",
  "host": "192.168.88.1",
  "port": 8728,
  "command": "/system/resource/print"
}
```

All fields except `host` and `command` are optional if set in environment variables.

#### Response

Success:
```json
{
  "success": true,
  "data": [
    {
      "uptime": "1d2h3m4s",
      "version": "6.49.7",
      "build-time": "Jan/01/2000 00:00:00",
      "free-memory": 1234567,
      "total-memory": 7654321,
      "cpu": "ARMv7",
      "cpu-count": "1",
      "cpu-frequency": "800",
      "cpu-load": "0",
      "free-hdd-space": "1234567",
      "total-hdd-space": "7654321",
      "architecture-name": "arm",
      "board-name": "RouterBOARD",
      "platform": "MikroTik"
    }
  ]
}
```

Error:
```json
{
  "success": false,
  "data": "Error message here"
}
```

### Example Usage

Using curl:
```bash
curl -X POST http://localhost:3000/api/mikrotik \
  -H "Content-Type: application/json" \
  -d '{
    "user": "admin",
    "pass": "password",
    "host": "192.168.88.1",
    "command": "/system/resource/print"
  }'
```

Using Python:
```python
import requests

response = requests.post('http://localhost:3000/api/mikrotik', json={
    'user': 'admin',
    'pass': 'password',
    'host': '192.168.88.1',
    'command': '/system/resource/print'
})

print(response.json())
```

## Health Check

Endpoint: GET /health
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok"
}
```

## Security Considerations

- The API bridge should be deployed behind a reverse proxy with HTTPS enabled
- Use environment variables for sensitive information
- Implement proper network segmentation to restrict access to the API
- Consider implementing authentication for the HTTP endpoint in production

## License

MIT
