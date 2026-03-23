import { createContext, useState } from 'react'

export const PlayerContext = createContext()

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null)
  const [queue, setQueue] = useState([])

  // Play a song - just sets current song and queue (no audio playback)
  const play = (song, queueList = []) => {
    if (!song) return
    setCurrentSong(song)
    setQueue(queueList)
  }

  // Open Spotify URL in new tab
  const openInSpotify = () => {
    if (currentSong?.spotifyUrl) {
      window.open(currentSong.spotifyUrl, '_blank')
    }
  }

  // Next song
  const next = () => {
    if (queue.length === 0) return
    
    const currentIndex = queue.findIndex(s => s._id === currentSong?._id)
    const nextIndex = currentIndex + 1
    
    if (nextIndex < queue.length) {
      setCurrentSong(queue[nextIndex])
    }
  }

  // Previous song
  const prev = () => {
    if (queue.length === 0) return
    
    const currentIndex = queue.findIndex(s => s._id === currentSong?._id)
    const prevIndex = currentIndex - 1
    
    if (prevIndex >= 0) {
      setCurrentSong(queue[prevIndex])
    }
  }

  const value = {
    currentSong,
    queue,
    play,
    openInSpotify,
    next,
    prev
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}
