import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import styles from './NotFoundPage.module.css'

const NotFoundPage = () => {
    return (
        <div className={styles.container}>
            <p className={styles.code}>404</p>
            <h1 className={styles.title}>Page not found</h1>
            <p className={styles.message}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to={ROUTES.HOME} className={styles.homeLink}>
                Go home
            </Link>
        </div>
    )
}

export default NotFoundPage
