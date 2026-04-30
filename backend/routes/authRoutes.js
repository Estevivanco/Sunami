import express from 'express';
import {
  register,
  login,
  refresh,
  updatePassword,
  logout
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
} from '../middleware/userValidation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();


// POST /api/auth/register - Register a new user
router.post('/auth/register', validateRegister, register);

// POST /api/auth/login - Login user
router.post('/auth/login', validateLogin, login);

// POST /api/auth/refresh - Refresh access token using refresh token
router.post('/auth/refresh', refresh);


// PUT /api/auth/password - Update current user's password (requires auth)
router.put('/auth/password', authenticateToken, updatePassword);

// POST /api/auth/logout - Logout user (optional, mainly client-side)
router.post('/auth/logout', authenticateToken, logout);

export default router;
