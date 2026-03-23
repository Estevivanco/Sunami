import { useEffect, useState } from "react";
import { createContext } from "react";
import { handleLogin, handleLogout, handleRegister } from "../services/authService";



export const AuthContext = createContext()

export const AuthProvider = ({children}) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [error, setError] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const savedUser = localStorage.getItem("user")
        const token = localStorage.getItem("accessToken")
        
        if (savedUser && token) {
            try {
                setUser(JSON.parse(savedUser))
                setIsLoggedIn(true)
            } catch (err) {
                console.error('Error parsing user data:', err)
                localStorage.removeItem("user")
                localStorage.removeItem("accessToken")
            }
        }
        setLoading(false)
    }, [])

    const login = async (emailOrUsername, password) => {
        if (!emailOrUsername || !password) {
            setError("Missing input")
            return
        }

        try {
            const data = await handleLogin(emailOrUsername, password)
            setUser(data.user)
            setError(null)
            setIsLoggedIn(true)
        } catch (err) {
            setError(err.message)
            setIsLoggedIn(false)
        }
    }

    const register = async (username, email, password) => {
        if (!username || !email || !password) {
            setError("All fields are required")
            return
        }

        try {
            const data = await handleRegister(email, username, password)
            // Auto-login after registration
            setUser(data.user)
            setError(null)
            setIsLoggedIn(true)
        } catch (err) {
            setError(err.message)
            setIsLoggedIn(false)
        }
    }

    const logout = async () => {
        try {
            await handleLogout()
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            // Always clear local state even if API call fails
            // refreshToken finns i httpOnly cookie och rensas av backend
            localStorage.removeItem("user")
            localStorage.removeItem("accessToken")
            setUser(null)
            setIsLoggedIn(false)
            setError(null)
        }
    }

    const isAuthenticated = () => {
        return isLoggedIn && !!localStorage.getItem("accessToken")
    }

    const value = {
        user,
        isLoggedIn,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated
    }
    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
}
