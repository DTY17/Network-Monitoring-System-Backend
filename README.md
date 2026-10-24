# Express Backend API

A Node.js and Express backend that manages notifications, users, device details, and NAT mappings using MongoDB. The application also provides WebSocket support for interactive SSH terminal sessions.

## Features

- **Notification Management** — Create, retrieve, update, and delete notifications, with filtering, pagination, status management, and history.
- **User Management** — User registration, login, user listing, and user count operations.
- **Device Management** — CRUD operations for network device details.
- **NAT Mapping Management** — Manage mappings between original device IP addresses and reachable network endpoints.
- **SSH Connectivity** — Connect to network devices associated with notifications using SSH.
- **Interactive SSH Terminal** — WebSocket-based communication for remote terminal sessions.
- **MongoDB Integration** — Persistent data storage using Mongoose.

## Technologies Used

- Node.js
- Express.js
- TypeScript / JavaScript, depending on the source files
- MongoDB
- Mongoose
- WebSocket (`ws`)
- SSH2 (`ssh2`)

## API Routes

| Endpoint | Description |
|---|---|
| `/api/v1/notification` | Notification management |
| `/api/v1/devicedetail` | Network device details |
| `/api/v1/user` | User operations |
| `/api/v1/natmapping` | NAT mapping operations |
| `/api/v1/notification/ssh-terminal/:id` | WebSocket endpoint for SSH terminal sessions |

The available HTTP methods and additional operations depend on the route definitions and controllers.

## SSH Terminal

The backend creates an HTTP server and attaches a WebSocket server for interactive SSH sessions.

```text
/api/v1/notification/ssh-terminal/:id
```

The `:id` parameter identifies the notification associated with the requested terminal session. The SSH connection logic uses notification and device information, together with NAT mapping details, to locate the appropriate device endpoint.

## Configuration

Configure the MongoDB connection string and other environment-specific values outside the source code.

Example `.env` configuration:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/network_monitoring
```

Use the environment variable names expected by your implementation. Do not commit database credentials or SSH passwords to GitHub.

## Installation and Execution

Install the dependencies listed in `package.json`:

```bash
npm install
```

Run the application using the script configured in `package.json`. For example, if a development script exists:

```bash
npm run dev
```

The exact command depends on the scripts configured in the project.

## Security Considerations

- Keep database connection strings and SSH credentials in environment variables or a secrets manager.
- Apply authentication and role-based authorization to protected API routes and WebSocket connections.
- Validate notification IDs, device details, and requested SSH destinations on the server.
- Restrict SSH access to authorized users and devices.
- Avoid legacy SSH algorithms unless required for a specific isolated lab device.
- Use secure transport and appropriate network restrictions when deploying beyond a local lab.
- Rotate any credentials that have been exposed publicly.

## Purpose

This backend provides the API and connectivity layer for managing network notifications and device information, supporting task workflows, and enabling SSH-based troubleshooting through a centralized application.
