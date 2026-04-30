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
export const fetchWithAuth = async (url, options = {}, signal) => {
    const headers = {
        ...getAuthHeaders(),
        ...options.headers
    }

    const config = {
        ...options,
        headers,
        credentials: 'include',
        ...(signal && { signal })  // ✅ only add signal if provided
    }

    try {
        let response = await fetch(url, config)

        if (response.status === 401) {
            try {
                await handleRefresh()
                const newHeaders = {
                    ...getAuthHeaders(),
                    ...options.headers
                }
                response = await fetch(url, {
                    ...config,
                    headers: newHeaders
                })
            } catch (refreshError) {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('user')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        return response
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('API request failed:', error)
        }
        throw error
    }
}

// Pass signal through all shorthand methods
export const get = async (url, signal) => {
    const response = await fetchWithAuth(url, { method: 'GET' }, signal)
    return response.json()
}

export const post = async (url, data, signal) => {
    const response = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(data)
    }, signal)
    return response.json()
}

export const put = async (url, data, signal) => {
    const response = await fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    }, signal)
    return response.json()
}

export const del = async (url, signal) => {
    const response = await fetchWithAuth(url, { method: 'DELETE' }, signal)
    return response.json()
}
