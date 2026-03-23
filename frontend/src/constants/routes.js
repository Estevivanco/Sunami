/**
 * Route Constants
 * Define all application routes in one place
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Main navigation routes
  SEARCH: '/search',
  LIBRARY: '/library',
  
  // Content routes (with parameters)
  PLAYLIST: '/playlist/:id',
  ARTIST: '/artist/:id',
  ALBUM: '/album/:id',
  
  // User routes
  PROFILE: '/profile',
  SETTINGS: '/settings',
}

/**
 * Helper functions to generate dynamic routes
 */
export const getPlaylistRoute = (id) => `/playlist/${id}`
export const getArtistRoute = (id) => `/artist/${id}`
export const getAlbumRoute = (id) => `/album/${id}`
export const getUserRoute = (id) => `/user/${id}`

/**
 * Protected routes - require authentication
 */
export const PROTECTED_ROUTES = [
  ROUTES.LIBRARY,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
]

/**
 * Public routes - accessible without authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
]

/**
 * Check if a route requires authentication
 */
export const isProtectedRoute = (path) => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route))
}

/**
 * Check if a route is public only (redirect if authenticated)
 */
export const isPublicOnlyRoute = (path) => {
  return PUBLIC_ROUTES.some(route => path === route)
}

