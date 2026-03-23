import { getArtistSongs } from '../data/spotify.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Export Spotify data to JSON file for manual editing
 * Run with: node backend/scripts/exportSpotifyData.js
 */
async function exportSpotifyData() {
  try {
    console.log('🎵 Fetching data from Spotify API...\n');

    const artistNames = [
      'Bad Bunny',
      'Taylor Swift',
      'The Weeknd',
      'Drake',
      'Feid',
      'Bruno Mars',
      'Ariana Grande',
      'Olivia Rodrigo',
      'Sabrina Carpenter',
      'Ed Sheeran',
      'Lil Baby'
    ];

    const allData = {
      exportDate: new Date().toISOString(),
      artists: []
    };

    for (const artistName of artistNames) {
      console.log(`Fetching ${artistName}...`);
      
      const { artist, albums, songs } = await getArtistSongs(artistName);
      
      allData.artists.push({
        name: artist.name,
        image: artist.image,
        genres: artist.genres,
        // Add these fields manually later:
        bio: '',
        verified: true,
        monthlyListeners: 0,
        followers: 0,
        albums: albums.map(album => ({
          title: album.name,
          releaseDate: album.releaseDate,
          coverImage: album.coverImage,
          type: album.type
        })),
        songs: songs.map(song => ({
          title: song.title,
          duration: song.duration,
          albumName: song.albumName,
          trackNumber: song.trackNumber,
          spotifyUrl: song.spotifyUrl,
          // Add these fields manually:
          previewUrl: null, // Add your own preview URLs here
          playCount: 0,
          popularity: 0
        }))
      });
      
      console.log(`✅ ${artist.name}: ${albums.length} albums, ${songs.length} songs`);
    }

    // Save to file
    const outputPath = path.join(__dirname, '../data/musicData.json');
    fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
    
    console.log(`\n✅ Data exported to: ${outputPath}`);
    console.log('\nNow you can:');
    console.log('1. Edit musicData.json to add bio, playCount, popularity, preview URLs, etc.');
    console.log('2. Run the new seed script to load this data into MongoDB');
    
  } catch (error) {
    console.error('Error exporting data:', error);
    process.exit(1);
  }
}

exportSpotifyData();
