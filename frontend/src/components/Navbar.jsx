import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import styles from './Navbar.module.css'
import { useAuth } from '../hooks/useAuth'

/**
 * Navbar Component
 * Top navigation bar with back/forward buttons and auth links
 */
function Navbar() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()

  const handleLogoutClick = async () => {
    try {
      await logout()
      navigate(ROUTES.LOGIN)
    } catch (error) {
      console.error('Logout error:', error)
      // Navigate to login anyway
      navigate(ROUTES.LOGIN)
    }
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.navButtons}>
        <button className={styles.navBtn} onClick={() => navigate(-1)}>←</button>
        <button className={styles.navBtn} onClick={() => navigate(1)}>→</button>
      </div>
      
      <div className={styles.userMenu}>
        <Link to={ROUTES.LIBRARY} className={styles.btnLink}>
          {user?.username || 'User'}
        </Link>
        <button onClick={handleLogoutClick} className={styles.btnLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar
