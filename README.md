# MyAvami

MyAvami is a comprehensive, modern, and feature-rich inventory management and point-of-sale (POS) system designed specifically for pharmacies. It provides a complete solution for managing products, suppliers, sales, and employees, with separate interfaces for administrators and staff.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd myavami
    ```

2.  **Build and run the containers:**

    ```bash
    docker-compose up --build
    ```

3.  **Access the application:**
    - **Frontend (Client)**: [http://localhost:5173](http://localhost:5173)
    - **Backend (Server)**: [http://localhost:5555](http://localhost:5555)

## Development

To run the backend server:

1.  Navigate to the project root directory.
2.  Ensure you have a local MongoDB instance running or use the one from `docker-compose`.
3.  Install dependencies (if a `package.json` is added to `server/`): `npm install`.
4.  Start the server: `node server/server.js`.

### Frontend

To run the frontend client:

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Project Structure

```
/
├── client/         # React frontend application
│   ├── src/
│   └── Dockerfile
├── server/         # Node.js/Express backend application
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── Dockerfile
├── docker-compose.yml # Defines and runs the multi-container application
└── README.md
```
