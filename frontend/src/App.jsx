import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import { LibraryProvider } from './context/LibraryContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import MusicPlayer from './components/MusicPlayer'
import './App.css'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import LibraryPage from './pages/LibraryPage'
import PlaylistPage from './pages/PlaylistPage'
import ArtistPage from './pages/ArtistPage'
import AlbumPage from './pages/AlbumPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'


function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <PlayerProvider>
          <Router>
            <Routes>
              {/* Auth routes - no app layout */}
              <Route path={ROUTES.LOGIN} element={<LoginPage/>} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage/>} />
              
              {/* Main app routes - with layout (protected) */}
              <Route path="*" element={
                <ProtectedRoute>
                  <div className="app">
                    <Sidebar />
                    
                    <main className="main-content">
                      <Navbar />
                      
                      <div className="content">
                        <Routes>
                          <Route path={ROUTES.HOME} element={<HomePage/>} />
                          <Route path={ROUTES.SEARCH} element={<SearchPage/>} />
                          <Route path={ROUTES.LIBRARY} element={<LibraryPage/>} />
                          <Route path={ROUTES.PLAYLIST} element={<PlaylistPage/>} />
                          <Route path={ROUTES.ARTIST} element={<ArtistPage />} />
                          <Route path={ROUTES.ALBUM} element={<AlbumPage/>} />
                        </Routes>
                      </div>
                    </main>
                    
                    <MusicPlayer />
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </PlayerProvider>
      </LibraryProvider>
    </AuthProvider>
  )
}

export default App
