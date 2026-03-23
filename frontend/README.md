# 🎵 Music App - Frontend

En modern musikstreaming-applikation byggd med React, med avancerade funktioner som Context API, custom hooks, JWT-autentisering och en fullt fungerande musikspelare.

---

## 📋 Innehåll

- [Teknisk Stack](#-teknisk-stack)
- [Avancerade Funktioner](#-avancerade-funktioner)
- [Installation](#-installation)
- [Projektstruktur](#-projektstruktur)
- [Context Architecture](#-context-architecture)
- [Custom Hooks](#-custom-hooks)
- [Autentiseringsflöde](#-autentiseringsflöde)
- [Routing & Navigation](#-routing--navigation)
- [Components](#-components)
- [State Management](#-state-management)

---

## 🚀 Teknisk Stack

- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.13.1
- **Build Tool**: Vite 7.3.1
- **Styling**: CSS Modules
- **State Management**: React Context API
- **API Communication**: Fetch API
- **Authentication**: JWT (Access & Refresh Tokens)

---

## ✨ Avancerade Funktioner

### 1. **Context API Architecture** 🏗️

Applikationen använder tre separata contexts för olika ansvarsområden:

#### 🔐 AuthContext

- JWT-baserad autentisering
- Auto-login från localStorage
- Automatisk token refresh
- Role-based access (user/admin)
- Persistent session management

#### 🎵 PlayerContext

- Global musikspelare state
- Play/pause/skip funktionalitet
- Kölhantering (queue)
- Current song tracking
- Cross-component audio control

#### 🎨 ThemeContext

- Light/dark mode toggle
- Persistent theme preference
- Global theme state
- CSS custom properties

**Varför separata contexts?**

- ✅ Separation of concerns
- ✅ Bättre performance (mindre re-renders)
- ✅ Lättare att testa
- ✅ Skalbar arkitektur

### 2. **Custom Hooks** 🎣

Abstraherar komplex logik till återanvändbara hooks:

#### `useAuth()`

```javascript
const {
  user, // Current user object
  isLoggedIn, // Boolean auth status
  loading, // Initial auth check
  login, // Login function
  register, // Register function
  logout, // Logout function
  isAuthenticated, // Helper function
} = useAuth();
```

#### `usePlayer()`

```javascript
const {
  currentSong, // Currently playing song
  isPlaying, // Play/pause state
  queue, // Song queue
  play, // Play song
  pause, // Pause playback
  next, // Skip to next
  previous, // Go to previous
} = usePlayer();
```

#### `useFetch()`

```javascript
const { data, loading, error, refetch } = useFetch("/api/songs");
```

### 3. **Protected Routes** 🛡️

Implementering av route guards:

```javascript
<Route
  path="/library"
  element={
    <ProtectedRoute>
      <LibraryPage />
    </ProtectedRoute>
  }
/>
```

**Features:**

- Automatisk redirect till /login om ej autentiserad
- Behåller intended destination (kommer tillbaka efter login)
- Loading state under auth check
- Seamless UX

### 4. **Service Layer Architecture** 🏢

Separata API services för varje resurs:

```
services/
├── authService.js      # Login, register, refresh, logout
├── songService.js      # Song CRUD & search
├── artistService.js    # Artist operations
├── albumService.js     # Album operations
├── playlistService.js  # Playlist management
└── userService.js      # User profile operations
```

**Fördelar:**

- ✅ Centraliserad API-kommunikation
- ✅ Easy token injection
- ✅ Error handling på ett ställe
- ✅ DRY principles

### 5. **Automatic Token Refresh** 🔄

Implementerar transparent token refresh:

```javascript
// Om 401 error
→ Försök refresh token
→ Få ny access token
→ Retry original request
→ Seamless för användaren
```

### 6. **Real-time Music Player** 🎶

Full-featured musik player med:

- ✅ Play/pause/skip
- ✅ Progress bar med seek functionality
- ✅ Volume control
- ✅ Queue management
- ✅ Persistent state
- ✅ Keyboard shortcuts
- ✅ Cross-page playback

---

## 📦 Installation

### Förutsättningar

- Node.js v18+
- Backend API running (se backend README)
- npm eller yarn

### Setup

1. **Navigera till frontend:**

```bash
cd frontend
```

2. **Installera dependencies:**

```bash
npm install
```

3. **Konfigurera API URL:**

Uppdatera `src/constants/api.js`:

```javascript
export const API_BASE_URL = "http://localhost:3000/api";
```

4. **Starta dev server:**

```bash
npm run dev
```

Frontend körs på: `http://localhost:5173`

### Build för Production

```bash
npm run build
npm run preview  # Testa production build
```

---

## 📁 Projektstruktur

```
frontend/src/
├── assets/                    # Images, icons, static files
├── components/
│   ├── Button.jsx             # Reusable button component
│   ├── Card.jsx               # Reusable card component
│   ├── MusicPlayer.jsx        # Global music player
│   ├── MusicPlayer.module.css
│   ├── Navbar.jsx             # Top navigation
│   ├── Navbar.module.css
│   ├── ProtectedRoute.jsx     # Route guard component
│   ├── Sidebar.jsx            # Side navigation
│   └── Sidebar.module.css
├── constants/
│   ├── api.js                 # API base URL
│   └── routes.js              # Route constants & helpers
├── context/
│   ├── AuthContext.jsx        # Auth state & functions
│   ├── PlayerContext.jsx      # Music player state
│   └── ThemeContext.jsx       # Theme state
├── hooks/
│   ├── useAuth.js             # Auth hook
│   ├── useFetch.js            # Data fetching hook
│   └── usePlayer.js           # Player hook
├── pages/
│   ├── HomePage.jsx           # Landing/home page
│   ├── HomePage.module.css
│   ├── LoginPage.jsx          # Login form
│   ├── LoginPage.module.css
│   ├── RegisterPage.jsx       # Registration form
│   ├── RegisterPage.module.css
│   ├── SearchPage.jsx         # Search functionality
│   ├── SearchPage.module.css
│   ├── LibraryPage.jsx        # User's library
│   ├── LibraryPage.module.css
│   ├── ArtistPage.jsx         # Artist detail page
│   ├── ArtistPage.module.css
│   ├── AlbumPage.jsx          # Album detail page
│   ├── AlbumPage.module.css
│   ├── PlaylistPage.jsx       # Playlist detail page
│   └── PlaylistPage.module.css
├── services/
│   ├── authService.js         # Auth API calls
│   ├── songService.js         # Song API calls
│   ├── artistService.js       # Artist API calls
│   ├── albumService.js        # Album API calls
│   ├── playlistService.js     # Playlist API calls
│   └── userService.js         # User API calls
├── utils/
│   └── formatDuration.js      # Time formatting utility
├── App.jsx                    # Main app component
├── App.css                    # Global styles
├── main.jsx                   # Entry point
└── index.css                  # Base CSS
```

---

## 🏗️ Context Architecture

### AuthContext Implementation

```javascript
// Provider Level
<AuthProvider>
  <App />
</AuthProvider>

// Consumer Level
const { user, login, logout } = useAuth()

// Features
- Persistent login (localStorage)
- Auto-login on refresh
- Loading state management
- Error handling
- Token management
```

**State:**

```javascript
{
  user: { id, username, email, role },
  isLoggedIn: boolean,
  loading: boolean,
  error: string | null
}
```

**Methods:**

```javascript
login(emailOrUsername, password); // Login user
register(username, email, password); // Register user
logout(); // Logout user
isAuthenticated(); // Check if authenticated
```

### PlayerContext Implementation

```javascript
// Global State för Musikspelare
{
  currentSong: Song | null,
  queue: Song[],
  currentIndex: number,
  isPlaying: boolean
}

// Actions
play(song, queue)    // Spela låt med kö
pause()              // Pausa
resume()             // Fortsätt
next()               // Nästa låt
previous()           // Föregående låt
```

**Use Case:**

```javascript
// I vilken komponent som helst
const { play } = usePlayer()

<button onClick={() => play(song, allSongs)}>
  Play Song
</button>

// MusicPlayer component får automatiskt update
```

### ThemeContext Implementation

```javascript
{
  theme: 'light' | 'dark',
  toggleTheme: () => void
}

// Persistent via localStorage
// Applicerar CSS custom properties
```

---

## 🎣 Custom Hooks

### useAuth Hook

**Location:** `hooks/useAuth.js`

**Purpose:** Konsumera AuthContext

```javascript
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { user, login, isLoggedIn } = useAuth();

  return (
    <div>
      {isLoggedIn ? (
        <p>Welcome {user.username}!</p>
      ) : (
        <button onClick={() => login(email, password)}>Login</button>
      )}
    </div>
  );
}
```

### usePlayer Hook

**Location:** `hooks/usePlayer.js`

**Purpose:** Konsumera PlayerContext

```javascript
import { usePlayer } from "../hooks/usePlayer";

function SongList({ songs }) {
  const { play, currentSong, isPlaying } = usePlayer();

  return songs.map((song) => (
    <div key={song.id}>
      <button onClick={() => play(song, songs)}>
        {currentSong?.id === song.id && isPlaying ? "⏸" : "▶"}
      </button>
      <span>{song.title}</span>
    </div>
  ));
}
```

### useFetch Hook

**Location:** `hooks/useFetch.js`

**Purpose:** Abstrakt data fetching med loading states

```javascript
import { useFetch } from "../hooks/useFetch";

function ArtistsList() {
  const { data: artists, loading, error } = useFetch("/artists");

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return <ArtistGrid artists={artists} />;
}
```

**Features:**

- ✅ Auto-fetches on mount
- ✅ Loading & error states
- ✅ Refetch function
- ✅ Cleanup on unmount

---

## 🔐 Autentiseringsflöde

### Registration Flow

```
1. User fyller i RegisterPage formulär
2. Frontend validerar (client-side)
3. POST /api/auth/register
4. Backend skapar user (role: "user")
5. Backend returnerar user + tokens
6. Frontend sparar:
   - user → localStorage
   - accessToken → localStorage
   - refreshToken → httpOnly cookie (auto)
7. AuthContext uppdaterar state
8. Auto-redirect till HomePage
```

### Login Flow

```
1. User fyller i LoginPage formulär
2. POST /api/auth/login
3. Backend validerar credentials
4. Backend returnerar user + tokens
5. Frontend sparar tokens + user
6. AuthContext uppdaterar state
7. Redirect till HOME eller intended page
```

### Token Refresh Flow

```
1. API request → 401 Unauthorized
2. Auth service interceptar error
3. POST /api/auth/refresh (med refreshToken cookie)
4. Få ny access token
5. Uppdatera localStorage
6. Retry original request
7. Return result till användare

// Seamless - user märker ingenting!
```

### Logout Flow

```
1. User klickar logout
2. POST /api/auth/logout
3. Backend invaliderar refresh token
4. Frontend rensar:
   - localStorage (user + token)
   - AuthContext state
5. Redirect till login page
```

---

## 🛣️ Routing & Navigation

### Route Structure

```javascript
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/search" element={<SearchPage />} />
  <Route path="/artist/:id" element={<ArtistPage />} />
  <Route path="/album/:id" element={<AlbumPage />} />
  <Route path="/playlist/:id" element={<PlaylistPage />} />

  {/* Protected Routes */}
  <Route
    path="/library"
    element={
      <ProtectedRoute>
        <LibraryPage />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Route Constants

**Location:** `constants/routes.js`

```javascript
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  SEARCH: "/search",
  LIBRARY: "/library",
  PLAYLIST: "/playlist/:id",
  ARTIST: "/artist/:id",
  ALBUM: "/album/:id",
};

// Helper functions
export const getArtistRoute = (id) => `/artist/${id}`;
export const getAlbumRoute = (id) => `/album/${id}`;
export const getPlaylistRoute = (id) => `/playlist/${id}`;
```

### Protected Route Implementation

```javascript
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated()) {
    // Redirect men kom ihåg var de ville gå
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

---

## 🎨 Components

### MusicPlayer Component

**Global persistent music player**

**Features:**

- 🎵 Play/pause/skip controls
- ⏱️ Progress bar med seek
- 🔊 Volume control
- 📋 Song info display
- ⏭️ Queue navigation
- 🎹 Keyboard shortcuts

**State management:**

- Konsumerar PlayerContext
- Synkar med `<audio>` element
- Persistent across page navigation

### Navbar Component

**Top navigation bar**

- Logo/branding
- Search bar
- User menu (if logged in)
- Login/Register buttons (if logged out)
- Responsive design

### Sidebar Component

**Side navigation**

- Home
- Search
- Library (protected)
- Create Playlist (protected)
- Liked Songs (protected)
- Scroll-aware styling

### ProtectedRoute Component

**Route guard wrapper**

```javascript
<ProtectedRoute>
  <SensitiveComponent />
</ProtectedRoute>
```

---

## 📊 State Management

### Global State (Context)

```
AuthContext → User authentication state
PlayerContext → Music player state
ThemeContext → UI theme state
```

### Local State (useState)

Används för:

- Form inputs
- UI toggles (modals, dropdowns)
- Page-specific data
- Loading states

### Server State (useFetch)

Cachar och hanterar:

- API responses
- Loading states
- Error states
- Refetch triggers

---

## 🎯 Best Practices Implementerade

### 1. **Separation of Concerns**

- ✅ Services för API calls
- ✅ Context för global state
- ✅ Hooks för logik abstraktion
- ✅ Components för UI

### 2. **DRY Principles**

- ✅ Reusable components (Button, Card)
- ✅ Custom hooks (useAuth, usePlayer)
- ✅ Shared constants (routes, api)
- ✅ Utility functions

### 3. **Performance**

- ✅ CSS Modules (scoped styles)
- ✅ Lazy loading potential
- ✅ Minimal context re-renders
- ✅ Efficient data fetching

### 4. **User Experience**

- ✅ Loading states
- ✅ Error messages
- ✅ Optimistic UI updates
- ✅ Smooth transitions
- ✅ Persistent player

### 5. **Security**

- ✅ Protected routes
- ✅ Token in httpOnly cookies
- ✅ Auto token refresh
- ✅ Secure logout
- ✅ Input validation

---

## 🚀 Scripts

```bash
# Development
npm run dev        # Starta dev server (hot reload)

# Production
npm run build      # Bygg för production
npm run preview    # Preview production build

# Quality
npm run lint       # Kör ESLint
```

---

## 🔧 Konfiguration

### Vite Config

**Location:** `vite.config.js`

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

### ESLint Config

**Location:** `eslint.config.js`

Använder:

- `@eslint/js`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`

---

## 🎓 Lärande & Avancerade Koncept

Detta projekt demonstrerar:

### React Patterns

- ✅ Context API för state management
- ✅ Custom hooks pattern
- ✅ Compound components
- ✅ Protected routes pattern
- ✅ Service layer architecture

### JavaScript/ES6+

- ✅ ES Modules
- ✅ Async/await
- ✅ Destructuring
- ✅ Optional chaining
- ✅ Template literals

### Arkitektur

- ✅ Layered architecture
- ✅ Separation of concerns
- ✅ Single responsibility principle
- ✅ DRY principles
- ✅ Scalable folder structure

---

## 🐛 Troubleshooting

### Problem: "Network Error"

**Lösning:** Kolla att backend körs på port 3000

### Problem: "Token expired"

**Lösning:** Automatisk refresh borde hantera detta, annars logout/login

### Problem: "CORS Error"

**Lösning:** Kontrollera backend CORS config, whitelist frontend URL

### Problem: Player inte spelar

**Lösning:** Kontrollera att songs har `audioUrl`, browser audio permissions

---

## 📝 Future Improvements

Potentiella nästa steg:

- [ ] TypeScript migration
- [ ] React Query för server state
- [ ] Infinite scroll
- [ ] Offline support (PWA)
- [ ] Audio visualizer
- [ ] Playlist collaboration
- [ ] Social features (following, sharing)
- [ ] Admin dashboard

---

## 📄 Licens

ISC

---

## 👨‍💻 Utvecklare

Byggt med ❤️ och React
