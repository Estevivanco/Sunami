/**
 * LoginPage
 * User login page with form validation and error handling
 */

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ROUTES } from "../constants/routes"
import { useAuth } from "../hooks/useAuth"
import styles from './LoginPage.module.css'

const LoginPage = () => {
    const navigate = useNavigate()
    const { login, isAuthenticated, loading: authLoading } = useAuth()

    const [usernameOrEmail, setUsernameOrEmail] = useState("")
    const [password, setPassword] = useState("")
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

    const submitLogin = async (e) => {
        e.preventDefault()
        
        if (!usernameOrEmail || !password) {
            setError('Please fill in all fields')
            return
        }
        
        try {
            setLoading(true)
            setError(null)
            await login(usernameOrEmail, password)
            navigate(ROUTES.HOME)
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <h1 className={styles.title}>Log in to Sunami</h1>
                
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={submitLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="usernameOrEmail" className={styles.label}>
                            Email or username
                        </label>
                        <input 
                            id="usernameOrEmail"
                            type="text"
                            placeholder="Email or username"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            className={styles.input}
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <input 
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>
                        
                    <button 
                        type="submit" 
                        className={styles.loginButton}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className={styles.divider}></div>

                <p className={styles.signupPrompt}>
                    Don't have an account? <Link to={ROUTES.REGISTER} className={styles.signupLink}>Sign up for Sunami</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage