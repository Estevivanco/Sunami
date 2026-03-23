/**
 * User Service
 * Handles all user-related API calls (not authentication)
 * Authentication handled in authService.js
 */

import { API_ENDPOINTS, BASE_URL } from '../constants/api'
import { get, post, put, del } from './api'

/**
 * Get current user's profile (requires auth)
 */
export const getCurrentProfile = async () => {
    return await get(API_ENDPOINTS.USER_PROFILE)
}

/**
 * Update current user's profile (requires auth)
 */
export const updateProfile = async (userData) => {
    return await put(API_ENDPOINTS.USER_PROFILE, userData)
}

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
    return await get(API_ENDPOINTS.USERS)
}

/**
 * Get user by ID (requires auth)
 */
export const getUserById = async (userId) => {
    return await get(API_ENDPOINTS.USER_BY_ID(userId))
}

/**
 * Update user by ID (admin only)
 */
export const updateUser = async (userId, userData) => {
    return await put(API_ENDPOINTS.USER_BY_ID(userId), userData)
}

/**
 * Delete user by ID (admin only)
 */
export const deleteUser = async (userId) => {
    return await del(API_ENDPOINTS.USER_BY_ID(userId))
}

/**
 * Make user admin (admin only)
 */
export const makeAdmin = async (userId) => {
    return await post(API_ENDPOINTS.MAKE_ADMIN(userId))
}

/**
 * Delete current user's account (requires auth)
 */
export const deleteAccount = async () => {
    return await del(`${BASE_URL}/users/me/account`)
}

/**
 * Library Operations
 */

// Get user's library (liked songs, saved albums, followed artists)
export const getUserLibrary = async () => {
    return await get(`${BASE_URL}/users/me/library`)
}

// Song library operations
export const likeSong = async (songId) => {
    return await post(`${BASE_URL}/users/me/songs/${songId}`)
}

export const unlikeSong = async (songId) => {
    return await del(`${BASE_URL}/users/me/songs/${songId}`)
}

// Album library operations
export const saveAlbum = async (albumId) => {
    return await post(`${BASE_URL}/users/me/albums/${albumId}`)
}

export const unsaveAlbum = async (albumId) => {
    return await del(`${BASE_URL}/users/me/albums/${albumId}`)
}

// Artist library operations
export const followArtist = async (artistId) => {
    return await post(`${BASE_URL}/users/me/artists/${artistId}`)
}

export const unfollowArtist = async (artistId) => {
    return await del(`${BASE_URL}/users/me/artists/${artistId}`)
}
