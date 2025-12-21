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

## Development

1.  Navigate to the project root directory.
2.  Ensure you have a local MongoDB instance running or use the one from `docker-compose`.
3.  Install dependencies (if a `package.json` is added to `server/`): `npm install`.
4.  Start the server: `node server/server.js`.

To run the frontend client:

    ```bash
    cd client
    npm install
    npm run dev
    ```
