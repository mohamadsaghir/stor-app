# Store App POS

A comprehensive store management application to track products, quantities, sales, profit changes, debts, and cash flow.

## Table of Contents
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation and Setup](#installation-and-setup)
- [Default Credentials](#default-credentials)
- [Auto-Login Bypass](#auto-login-bypass)
- [Admin Access](#admin-access)

## Key Features
- Product and Stock Management: Add new products, update prices, and track remaining stock.
- Profit Tracking: Calculate net profit per product and total store earnings.
- Debt Management: Monitor customer and supplier debts.
- Stock Change Logs: Review changes made to product quantities.
- Cash Out: Track and manage daily store expenses and payments.
- Auto-Login Bypass: Bypasses the login screen to access the store dashboard directly.

## Tech Stack
### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT (JSON Web Tokens)
- Bcrypt.js

### Frontend
- React.js
- React Router Dom
- Axios

## Installation and Setup

### Prerequisites
- Node.js (version 18 or higher)
- MongoDB running locally or remotely

### Steps
1. Install dependencies for the project, backend, and frontend:
   ```bash
   npm install
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
2. Configure environment variables:
   - Create a `.env` file in the `backend` directory containing:
     ```env
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     ```
   - Create a `.env` file in the `frontend` directory containing:
     ```env
     REACT_APP_API_URL=http://localhost:5000
     ```
3. Run the backend server:
   ```bash
   cd backend
   npm start
   ```
4. Run the frontend application:
   ```bash
   cd frontend
   npm start
   ```

## Default Credentials

### Store User Account (Auto-Logged In)
- Email: (Bypassed automatically, first active user is used)
- Password: (Bypassed automatically, no password needed)

### Admin Account (Admin Panel)
- Email: admin@admin.com
- Password: Admin

## Auto-Login Bypass
- The system automatically authenticates client requests by falling back to the first active (non-suspended) user in the MongoDB database.
- When mounting the Login component, a dummy token is generated in localStorage, and the page redirects to /dashboard instantly.

## Admin Access
- To access the admin panel, navigate to `/simple-admin-login` in your browser.
- Login using the Admin credentials listed above.
