/**
 * RegisterPage
 * User registration page with form validation and error handling
 */

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ROUTES } from "../constants/routes"
import { useAuth } from "../hooks/useAuth"
import styles from './RegisterPage.module.css'

const RegisterPage = () => {
    const navigate = useNavigate()
    const { register, isAuthenticated, loading: authLoading } = useAuth()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Redirect to home if already logged in
    useEffect(() => {
        if (!authLoading && isAuthenticated()) {
            navigate(ROUTES.HOME)
        }
    }, [authLoading, isAuthenticated, navigate])

    // Show loading while checking auth status
    if (authLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                color: '#fff'
            }}>
                Loading...
            </div>
        )
    }

    const validateForm = () => {
        // Username validation
        if (username.length < 3) {
            setError('Username must be at least 3 characters long')
            return false
        }

        // Email validation
        const emailRegex = /^\S+@\S+\.\S+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            return false
        }

        // Password validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            return false
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return false
        }

        return true
    }

    const submitRegistration = async (e) => {
        e.preventDefault()
        
        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields')
            return
        }

        if (!validateForm()) {
            return
        }
        
        try {
            setLoading(true)
            setError(null)
            await register(username, email, password)
            navigate(ROUTES.HOME)
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.registerPage}>
            <div className={styles.registerCard}>
                <h1 className={styles.title}>Sign up for Sunami</h1>
                
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={submitRegistration} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}>
                            Username
                        </label>
                        <input 
                            id="username"
                            type="text"
                            placeholder="Enter a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email address
                        </label>
                        <input 
                            id="email"
                            type="email"
                            placeholder="name@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <input 
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            disabled={loading}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            Confirm password
                        </label>
                        <input 
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.input}
                            disabled={loading}
                            autoComplete="new-password"
                        />
                    </div>
                        
                    <button 
                        type="submit" 
                        className={styles.registerButton}
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <div className={styles.divider}></div>

                <p className={styles.loginPrompt}>
                    Already have an account? <Link to={ROUTES.LOGIN} className={styles.loginLink}>Log in here</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage