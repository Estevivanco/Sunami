import express from 'express';
import songRoutes from './songRoutes.js';
import albumRoutes from './albumRoutes.js';
import artistRoutes from './artistRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

// Använd routes
router.use('/api', authRoutes);      // Authentication routes (public)
router.use('/api', userRoutes);      // User management routes (protected)
router.use('/api', songRoutes);
router.use('/api', albumRoutes);
router.use('/api', artistRoutes);
router.use('/api', playlistRoutes);

export default router;
