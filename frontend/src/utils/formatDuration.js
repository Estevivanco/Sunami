/**
 * Duration Formatting Utilities
 * Convert seconds to readable time formats
 * 
 * Functions to implement:
 * - formatDuration(seconds) - Format as MM:SS or HH:MM:SS
 * - formatDurationShort(seconds) - Format as "3:45"
 * - formatDurationLong(seconds) - Format as "3 min 45 sec"
 * - parseDuration(timeString) - Convert "3:45" back to seconds
 * 
 * Examples:
 * formatDuration(225) => '3:45'
 * formatDuration(3665) => '1:01:05'
 * formatDurationLong(225) => '3 minutes 45 seconds'
 * parseDuration('3:45') => 225
 */

export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00'
  
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const formatDurationLong = (seconds) => {
  if (!seconds || seconds < 0) return '0 seconds'
  
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  const parts = []
  if (hrs > 0) parts.push(`${hrs} ${hrs === 1 ? 'hour' : 'hours'}`)
  if (mins > 0) parts.push(`${mins} ${mins === 1 ? 'minute' : 'minutes'}`)
  if (secs > 0) parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`)
  
  return parts.join(' ') || '0 seconds'
}
