import { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'

/**
 * usePlayer Hook
 * Custom hook to access PlayerContext
 * 
 * Usage:
 * const { currentSong, isPlaying, play, pause, next, prev } = usePlayer()
 */
export const usePlayer = () => {
  const context = useContext(PlayerContext)
  
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider')
  }
  
  return context
}
