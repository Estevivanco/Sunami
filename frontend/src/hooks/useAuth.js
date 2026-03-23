/**
 * useAuth Hook
 * Custom hook to access AuthContext
 * 
 * Usage:
 * const { user, isLoggedIn, login, logout, register, error } = useAuth()
 * 
 * Should return:
 * - user: Current user object (or null)
 * - isLoggedIn: Boolean authentication status
 * - error: Any authentication errors
 * - login(email, password): Function to log in
 * - register(userData): Function to register new user
 * - logout(): Function to log out
 * 
 * Example implementation:
 * import { useContext } from 'react'
 * import { AuthContext } from '../context/AuthContext'
 * 
 * export const useAuth = () => {
 *   const context = useContext(AuthContext)
 *   if (!context) {
 *     throw new Error('useAuth must be used within AuthProvider')
 *   }
 *   return context
 * }
 */

import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

export const useAuth = () => {
    const context = useContext(AuthContext)
    if(!context) {
        throw new Error('useAuth must be used with AuthProvider')
    }
    return context
}