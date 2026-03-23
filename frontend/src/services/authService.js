/**
 * Authentication Service
 * Handles all authentication-related API calls
 * 
 * Functions to implement:
 * - login(email, password) - POST to /api/auth/login
 * - register(userData) - POST to /api/auth/register
 * - logout() - POST to /api/auth/logout (clear tokens)
 * - refreshToken() - POST to /api/auth/refresh (get new access token)
 * - updatePassword(currentPassword, newPassword) - PUT to /api/auth/password
 * - getCurrentUser() - GET user profile from /api/users/profile
 * 
 * Should handle:
 * - Storing/removing JWT tokens in localStorage
 * - Setting Authorization headers
 * - Error handling for 401/403 responses
 */

import { API_ENDPOINTS } from '../constants/api'

// TODO: Implement authentication functions

export const handleLogin = async (emailOrUsername, password) => {
    // Determine if input is email or username
    const isEmail = emailOrUsername.includes('@');
    
    const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include', // Nödvändigt för att ta emot httpOnly cookies
        body: JSON.stringify(
            isEmail 
                ? { email: emailOrUsername, password }
                : { username: emailOrUsername, password }
        )
    })

    if(!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login Failed')
    }

    const data = await response.json()

    // Spara endast accessToken och user - refreshToken finns i httpOnly cookie
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    return data
}

export const handleRegister = async (email, username, password) => {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include', // Nödvändigt för att ta emot httpOnly cookies
        body: JSON.stringify({username, email, password})
    })

    if(!response.ok) throw new Error('Register failed')

    const data = await response.json()

    // Spara endast accessToken och user - refreshToken finns i httpOnly cookie
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))

    return data
}

export const handleLogout = async () => {
    await fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        credentials: 'include' // Skickar med cookies så backend kan rensa refresh token
    })

    // Ta bort access token och user från localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
}

/**
 * Refresh access token using httpOnly refresh token cookie
 * Automatically sends refresh token from httpOnly cookie
 */
export const handleRefresh = async () => {
    const response = await fetch(API_ENDPOINTS.REFRESH, {
        method: 'POST',
        credentials: 'include' // Skickar refresh token cookie automatiskt
    })

    if (!response.ok) {
        throw new Error('Failed to refresh token')
    }

    const data = await response.json()

    // Uppdatera access token i localStorage
    localStorage.setItem('accessToken', data.accessToken)

    return data
}