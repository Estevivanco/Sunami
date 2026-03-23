import dotenv from 'dotenv';

// Ladda miljövariabler
dotenv.config();

// Validering av miljövariabler
const requiredEnvVars = [
  'MONGODB_URI', 
  'PORT', 
  'JWT_ACCESS_SECRET', 
  'JWT_REFRESH_SECRET',
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET'
];

// Kontrollera varje nödvändig variabel
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Exportera validerad config
export const config = {
  mongoUri: process.env.MONGODB_URI,
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
  }
};
