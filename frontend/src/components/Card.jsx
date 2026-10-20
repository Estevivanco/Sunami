import { Link } from 'react-router-dom'
import styles from './Card.module.css'

/**
 * Reusable card for albums, artists, and playlists.
 * Shows a hover play button that calls onPlay (if provided) or navigates.
 */
function Card({ image, title, subtitle, to, onPlay }) {
    const handlePlayClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (onPlay) onPlay()
    }

    return (
        <Link to={to} className={styles.card}>
            <div className={styles.imageWrapper}>
                {image ? (
                    <img src={image} alt={title} className={styles.image} />
                ) : (
                    <div className={styles.imageFallback} />
                )}
                <button
                    className={styles.playBtn}
                    onClick={handlePlayClick}
                    aria-label={`Play ${title}`}
                >
                    ▶
                </button>
            </div>
            <div className={styles.info}>
                <h3 className={styles.title}>{title}</h3>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
        </Link>
    )
}

export default Card
