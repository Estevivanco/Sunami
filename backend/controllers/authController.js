import userRepository from '../repositories/userRepository.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/**
 * Registrera ny användare
 * POST /api/auth/register
 */
const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('All fields are required', 400));
  }

  // Kontrollera om användare redan finns
  const existingUser = await userRepository.exists(email, username);
  if (existingUser) {
    return next(new AppError('User with this email or username already exists', 409));
  }

  // Skapa ny användare - ALLTID som vanlig användare, ignorera role från req.body
  const newUser = await userRepository.create({
    username,
    email,
    password,
    role: "user" // Tvinga användarroll, kan inte registrera som admin
  });

  // Generera tokens - automatisk inloggning efter registrering
  const accessToken = generateAccessToken(newUser._id, newUser.role);
  const refreshToken = generateRefreshToken(newUser._id, newUser.role);

  // Sätt refresh token som httpOnly cookie (säkert mot XSS)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS endast i produktion
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dagar
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
    // refreshToken skickas INTE i JSON - finns i httpOnly cookie
  });
});

/**
 * Logga in användare
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res, next) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    return next(new AppError('Email or username and password are required', 400));
  }

  // Hitta användare med lösenord - only call the appropriate function
  let user = null;
  if (email) {
    user = await userRepository.findByEmailWithPassword(email);
  } else if (username) {
    user = await userRepository.findByUsernameWithPassword(username);
  }
  
  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Jämför lösenord
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  // Sätt refresh token som httpOnly cookie (säkert mot XSS)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS endast i produktion
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dagar
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
    // refreshToken skickas INTE i JSON - finns i httpOnly cookie
  });
});

/**
 * Uppdatera access token med hjälp av refresh token
 * POST /api/auth/refresh
 */
const refresh = catchAsync(async (req, res, next) => {
  // Läs refresh token från httpOnly cookie istället för request body
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('Refresh token not found', 401));
  }

  // Verifiera refresh token (kastar fel om ogiltig)
  const payload = verifyRefreshToken(refreshToken);

  // Validera payload-strukturen
  if (!payload || !payload.userId) {
    return next(new AppError('Invalid refresh token payload', 403));
  }

  // Generera ny access token med roll från refresh token
  const accessToken = generateAccessToken(payload.userId, payload.role || 'user');
  
  // Generera även ny refresh token (refresh token rotation för extra säkerhet)
  const newRefreshToken = generateRefreshToken(payload.userId, payload.role || 'user');

  // Sätt ny refresh token som httpOnly cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dagar
  });

  res.json({ 
    accessToken,
    message: 'Access token refreshed successfully'
  });
});

/**
 * Uppdatera lösenord (kräver autentisering)
 * PUT /api/auth/password
 */
const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Current password and new password are required', 400));
  }

  // Använd req.userId från authenticateToken middleware
  const userId = req.userId;

  // Hämta användare
  const user = await userRepository.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Hämta användare med lösenord för jämförelse
  const userWithPassword = await userRepository.findByEmailWithPassword(user.email);
  
  // Verifiera nuvarande lösenord
  const isPasswordValid = await userWithPassword.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Uppdatera lösenord
  await userRepository.updatePassword(userId, newPassword);

  res.json({ message: 'Password updated successfully' });
});

/**
 * Logga ut användare
 * POST /api/auth/logout
 */
const logout = catchAsync(async (req, res, next) => {
  // Rensa refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
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
