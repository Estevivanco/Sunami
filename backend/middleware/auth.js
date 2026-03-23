import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/tokens.js';

/**
 * Middleware för att verifiera JWT-token och autentisera användare
 * Förväntar token i Authorization header: "Bearer <token>"
 */
export const authenticateToken = (req, res, next) => {
  try {
    // Hämta token från Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required' 
      });
    }

    // Verifiera token synkront
    const verifiedUser = verifyAccessToken(token);
    
    // Validera avkodad token-struktur
    if (!verifiedUser || !verifiedUser.userId) {
      return res.status(403).json({ 
        message: 'Invalid token payload' 
      });
    }

    // Bifoga användardata till request-objektet
    req.userId = verifiedUser.userId;
    req.user = verifiedUser; // Innehåller userId och role
    next();
  } catch (error) {
    // jwt.verify kastar specifika fel
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: 'Invalid token' 
      });
    }
    // Andra fel
    return res.status(500).json({ 
      message: 'Authentication error',
      error: error.message 
    });
  }
};

/**
 * Valfri middleware - autentiserar om token finns, men kräver det inte
 * Säkrare implementering som använder try-catch istället för callback
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Ingen token angiven - fortsätt utan autentisering
  if (!token) {
    return next();
  }

  try {
    // Verifiera och avkoda token synkront
    const decoded = verifyAccessToken(token);
    
    // Validera att avkodad token har userId
    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
    }
  } catch (error) {
    // Token ogiltig/utgången - ignorera tyst och fortsätt oautentiserad
    // Detta är avsiktligt för valfri autentisering
  }
  
  // Fortsätt alltid, oavsett om token var giltig eller inte
  next();
};

/**
 * Middleware för att kräva admin-roll
 * Måste användas EFTER authenticateToken middleware
 * Kontrollerar om den autentiserade användaren har admin-roll
 */
export const requireAdmin = (req, res, next) => {
  // Säkerställ att användaren är autentiserad först
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ 
      message: 'Authentication required' 
    });
  }

  // Kontrollera om användaren har admin-roll
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Forbidden: Admin access required' 
    });
  }

  next();
};
