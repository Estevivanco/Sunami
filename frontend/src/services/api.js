/**
 * API Utility Service
 * Central fetch wrapper with automatic token refresh on 401
 */

import { handleRefresh } from './authService'

/**
 * Get authorization headers with JWT token
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken')
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    }
}

/**
 * Centralized fetch wrapper with automatic token refresh
 * Automatically retries failed requests after refreshing token
 */
export const fetchWithAuth = async (url, options = {}) => {
    // Merge auth headers with provided options
    const headers = {
        ...getAuthHeaders(),
        ...options.headers
    }

    const config = {
        ...options,
        headers,
        credentials: 'include' // Always include cookies for refresh token
    }

    try {
        // Make the initial request
        let response = await fetch(url, config)

        // If 401 Unauthorized, try to refresh token and retry
        if (response.status === 401) {
            console.log('Token expired, attempting refresh...')
            
            try {
                // Refresh the access token
                await handleRefresh()
                console.log('Token refreshed successfully')

                // Retry the original request with new token
                const newHeaders = {
                    ...getAuthHeaders(),
                    ...options.headers
                }
                
                response = await fetch(url, {
                    ...config,
                    headers: newHeaders
                })
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
                // If refresh fails, clear auth and redirect to login
                localStorage.removeItem('accessToken')
                localStorage.removeItem('user')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }
        }

        // Handle other error status codes
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        return response
    } catch (error) {
        console.error('API request failed:', error)
        throw error
    }
}

/**
 * Shorthand for GET requests
 */
export const get = async (url) => {
    const response = await fetchWithAuth(url, { method: 'GET' })
    return response.json()
}

/**
 * Shorthand for POST requests
 */
export const post = async (url, data) => {
    const response = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(data)
    })
    return response.json()
}

/**
 * Shorthand for PUT requests
 */
export const put = async (url, data) => {
    const response = await fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
    return response.json()
}

/**
 * Shorthand for DELETE requests
 */
export const del = async (url) => {
    const response = await fetchWithAuth(url, { method: 'DELETE' })
    return response.json()
}
