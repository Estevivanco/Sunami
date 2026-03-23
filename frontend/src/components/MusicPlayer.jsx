import { usePlayer } from '../hooks/usePlayer'
import { formatDuration } from '../utils/formatDuration'
import styles from './MusicPlayer.module.css'

/**
 * MusicPlayer Component
 * Bottom music player bar (like Spotify)
 */
function MusicPlayer() {
  const { 
    currentSong, 
    openInSpotify, 
    next, 
    prev
  } = usePlayer()

  return (
    <footer className={styles.musicPlayer}>
      <div className={styles.playerLeft}>
        <div className={styles.nowPlaying}>
          {currentSong?.album?.coverImage && (
            <img 
              src={currentSong.album.coverImage} 
              alt={currentSong.title} 
              className={styles.albumArt}
            />
          )}
          <div className={styles.trackInfo}>
            <div className={styles.trackName}>
              {currentSong?.title || 'No song selected'}
            </div>
            <div className={styles.artistName}>
              {currentSong?.artist?.name || 'Select a song to view'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.playerCenter}>
        <div className={styles.playerControls}>
          <button 
            className={styles.controlBtn} 
            onClick={prev}
            disabled={!currentSong}
            title="Previous"
          >
            ⏮
          </button>
          <button 
            className={`${styles.controlBtn} ${styles.playBtn}`}
            onClick={openInSpotify}
            disabled={!currentSong}
            title="Play in Spotify"
          >
            ▶
          </button>
          <button 
            className={styles.controlBtn} 
            onClick={next}
            disabled={!currentSong}
            title="Next"
          >
            ⏭
          </button>
        </div>
        <div className={styles.progressBar}>
          <span className={styles.time}>0:00</span>
          <div className={styles.barContainer}>
            <div className={styles.bar}>
              <div 
                className={styles.barProgress} 
                style={{ width: '0%' }}
              />
            </div>
          </div>
          <span className={styles.time}>
            {currentSong ? formatDuration(currentSong.duration) : '0:00'}
          </span>
        </div>
      </div>

      <div className={styles.playerRight}>
        <button className={styles.volumeBtn}>🔊</button>
      </div>
    </footer>
  )
}

export default MusicPlayer
