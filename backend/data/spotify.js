import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Tokencache för att undvika onödiga API-anrop
let cachedToken = null;
let tokenExpiry = null;

/**
 * Hämta access token från Spotify (med caching)
 * Token är giltig i 1 timme, så vi cachar den
 */
const getSpotifyToken = async () => {
  try {
    // Returnera cached token om den fortfarande är giltig
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`
        },
        timeout: 10000 // 10 sekunder timeout
      }
    );

    // Cachea token (giltig i 3600 sekunder = 1 timme)
    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // -1 minut säkerhetsmarginal

    return cachedToken;
  } catch (error) {
    console.error('Spotify token error:', error.message);
    throw new Error('Failed to get Spotify access token');
  }
};

/**
 * Hämta låtar från en artist
 * @param {string} artistName - Artistens namn
 * @returns {Object} - { artist, albums, songs }
 */
const getArtistSongs = async (artistName) => {
  try {
    if (!artistName || artistName.trim() === '') {
      throw new Error('Artist name is required');
    }

    const token = await getSpotifyToken();
    const encodedArtistName = encodeURIComponent(artistName.trim());

    // 1. Sök efter artisten
    const artistResponse = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodedArtistName}&type=artist&limit=1`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      }
    );

    // Validera att artist hittades
    if (!artistResponse.data.artists.items || artistResponse.data.artists.items.length === 0) {
      throw new Error(`Artist "${artistName}" not found`);
    }

    const artist = artistResponse.data.artists.items[0];

    // 2. Hämta artistens album
    const albumsResponse = await axios.get(
      `https://api.spotify.com/v1/artists/${artist.id}/albums?limit=5`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      }
    );

    const albums = albumsResponse.data.items;

    // Validera att album finns
    if (!albums || albums.length === 0) {
      return {
        artist: {
          name: artist.name,
          id: artist.id,
          genres: artist.genres || [],
          popularity: artist.popularity || 0
        },
        albums: [],
        songs: []
      };
    }

    // 3. Hämta låtar från varje album
    const songs = [];
    for (const album of albums) {
      try {
        const tracksResponse = await axios.get(
          `https://api.spotify.com/v1/albums/${album.id}/tracks`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        );
        
        if (tracksResponse.data.items) {
          tracksResponse.data.items.forEach(track => {
            songs.push({
              title: track.name,
              duration: Math.round(track.duration_ms / 1000), // ms till sekunder
              albumName: album.name,
              artistName: artist.name,
              trackNumber: track.track_number,
              spotifyId: track.id,
              previewUrl: track.preview_url,
              spotifyUrl: track.external_urls?.spotify
            });
          });
        }
      } catch (trackError) {
        console.error(`Failed to fetch tracks for album ${album.name}:`, trackError.message);
        // Fortsätt med nästa album
      }
    }

    return {
      artist: {
        name: artist.name,
        id: artist.id,
        genres: artist.genres || [],
        popularity: artist.popularity || 0,
        spotifyUrl: artist.external_urls?.spotify,
        image: artist.images && artist.images.length > 0 ? artist.images[0].url : null
      },
      albums: albums.map(album => ({
        name: album.name,
        id: album.id,
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        spotifyUrl: album.external_urls?.spotify,
        coverImage: album.images && album.images.length > 0 ? album.images[0].url : null
      })),
      songs
    };
  } catch (error) {
    // Om det är ett valideringsfel, kasta vidare
    if (error.message.includes('required') || error.message.includes('not found')) {
      throw error;
    }
    
    // Annars, logga och kasta ett generiskt fel
    console.error('Spotify API error:', error.message);
    throw new Error('Failed to fetch artist data from Spotify');
  }
};

export { getSpotifyToken, getArtistSongs };