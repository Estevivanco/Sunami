/**
 * ProtectedRoute
 * Wrapper component that redirects to login if user is not authenticated
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../constants/routes'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    // Show nothing while checking authentication
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh',
                color: '#fff'
            }}>
                Loading...
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
        return <Navigate to={ROUTES.LOGIN} replace />
    }

    // Render protected content
    return children
}

export default ProtectedRoute
