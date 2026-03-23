# Sunami Music App

## Overview

Sunami is a full-stack music application with a React frontend and Node.js/Express backend, using MongoDB Atlas for data storage.

## Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB Atlas account (or use your own MongoDB URI)
- Spotify Developer account (for API credentials)

## Setup

### 1. Clone the repository

```
git clone https://github.com/Estevivanco/sunami.git
cd sunami
```

### 2. Install dependencies

```
cd backend
npm install
cd ../frontend
npm install
```

### 3. Configure environment variables

- Copy `.env.example` to `.env` in the `backend/` folder.
- Fill in your MongoDB URI, JWT secrets, and Spotify credentials.

### 4. Seed the database (optional)

```
cd backend
npm run seed
```

### 5. Start the backend server

```
cd backend
npm run dev
```

### 6. Start the frontend

```
cd frontend
npm run dev
```

## Usage

- Visit the frontend URL (default: http://localhost:5173)
- Register or log in to use the app

## Notes

- Do NOT commit your `.env` file or any secrets to GitHub.
- For development, you can whitelist your IP in MongoDB Atlas.
- For production, update CORS and environment settings as needed.
