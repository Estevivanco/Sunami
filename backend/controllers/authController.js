import userRepository from '../repositories/userRepository.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/**
 * Register new user
 * POST /api/auth/register
 */
const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('All fields are required', 400));
  }

  // Check if user already exists
  const existingUser = await userRepository.exists(email, username);
  if (existingUser) {
    return next(new AppError('User with this email or username already exists', 409));
  }

  // Create new user - ALWAYS as regular user, ignore role from req.body
  const newUser = await userRepository.create({
    username,
    email,
    password,
    role: "user" // Force user role, cannot register as admin
  });

  // Generate tokens - automatic login after registration
  const accessToken = generateAccessToken(newUser._id, newUser.role);
  const refreshToken = generateRefreshToken(newUser._id, newUser.role);

  // Set refresh token as httpOnly cookie (secure against XSS)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    },
    accessToken
    // refreshToken is NOT sent in JSON - it lives in the httpOnly cookie
  });
});

/**
 * Log in user
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res, next) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    return next(new AppError('Email or username and password are required', 400));
  }

  // Find user with password - only call the appropriate function
  let user = null;
  if (email) {
    user = await userRepository.findByEmailWithPassword(email);
  } else if (username) {
    user = await userRepository.findByUsernameWithPassword(username);
  }
  
  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Compare passwords
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  // Set refresh token as httpOnly cookie (secure against XSS)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    message: 'Login successful',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    accessToken
    // refreshToken is NOT sent in JSON - it lives in the httpOnly cookie
  });
});

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 */
const refresh = catchAsync(async (req, res, next) => {
  // Read refresh token from httpOnly cookie instead of request body
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('Refresh token not found', 401));
  }

  // Verify refresh token (throws if invalid)
  const payload = verifyRefreshToken(refreshToken);

  // Validate payload structure
  if (!payload || !payload.userId) {
    return next(new AppError('Invalid refresh token payload', 403));
  }

  // Generate new access token with role from refresh token
  const accessToken = generateAccessToken(payload.userId, payload.role || 'user');

  // Also generate new refresh token (refresh token rotation for extra security)
  const newRefreshToken = generateRefreshToken(payload.userId, payload.role || 'user');

  // Set new refresh token as httpOnly cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({ 
    accessToken,
    message: 'Access token refreshed successfully'
  });
});

/**
 * Update password (requires authentication)
 * PUT /api/auth/password
 */
const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Current password and new password are required', 400));
  }

  // Use req.userId from authenticateToken middleware
  const userId = req.userId;

  // Fetch user
  const user = await userRepository.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Fetch user with password for comparison
  const userWithPassword = await userRepository.findByEmailWithPassword(user.email);

  // Verify current password
  const isPasswordValid = await userWithPassword.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  await userRepository.updatePassword(userId, newPassword);

  res.json({ message: 'Password updated successfully' });
});

/**
 * Log out user
 * POST /api/auth/logout
 */
const logout = catchAsync(async (req, res, next) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  
  res.json({ message: 'Logout successful' });
});

export {
  register,
  login,
  refresh,
  updatePassword,
  logout
};
