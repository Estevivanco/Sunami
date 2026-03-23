/**
 * Date Formatting Utilities
 * 
 * Functions to implement:
 * - formatDate(dateString) - Format date to readable string
 * - formatRelativeTime(dateString) - Format as "2 hours ago", "yesterday", etc.
 * - formatDayMonth(dateString) - Format as "Jan 15"
 * - formatFullDate(dateString) - Format as "January 15, 2026"
 * 
 * Examples:
 * formatDate('2026-03-12T10:30:00') => 'Mar 12, 2026'
 * formatRelativeTime('2026-03-12T08:00:00') => '2 hours ago'
 * formatDayMonth('2026-03-12') => 'Mar 12'
 * 
 * Can use:
 * - Native Date API
 * - Intl.DateTimeFormat
 * - Or library like date-fns
 */

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export const formatDayMonth = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export const formatFullDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
