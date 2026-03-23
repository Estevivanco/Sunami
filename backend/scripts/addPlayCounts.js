import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Add realistic play counts and popularity scores to songs
 * Run with: node backend/scripts/addPlayCounts.js
 */

// Artist popularity tiers (affects base play counts)
const artistPopularity = {
  'Bad Bunny': 90,
  'Taylor Swift': 95,
  'The Weeknd': 88,
  'Drake': 92,
  'Feid': 75,
  'Bruno Mars': 85,
  'Ariana Grande': 87,
  'Olivia Rodrigo': 82,
  'Sabrina Carpenter': 78,
  'Ed Sheeran': 89,
  'Lil Baby': 80
};

function getRandomPlayCount(artistName, trackNumber, albumYear) {
  const basePopularity = artistPopularity[artistName] || 70;
  
  // Base multiplier (millions)
  let baseMultiplier = basePopularity / 10; // 7-9.5M for top artists
  
  // Newer albums get more plays
  const currentYear = new Date().getFullYear();
  const yearDiff = currentYear - albumYear;
  if (yearDiff <= 1) baseMultiplier *= 1.5; // Recent albums boost
  else if (yearDiff <= 2) baseMultiplier *= 1.2;
  
  // First 3 tracks usually more popular
  if (trackNumber === 1) baseMultiplier *= 1.8;
  else if (trackNumber === 2) baseMultiplier *= 1.4;
  else if (trackNumber === 3) baseMultiplier *= 1.2;
  else if (trackNumber > 10) baseMultiplier *= 0.6; // Deep cuts get fewer plays
  
  // Add randomness (±30%)
  const randomFactor = 0.7 + (Math.random() * 0.6);
  const playCount = Math.floor(baseMultiplier * 1000000 * randomFactor);
  
  return playCount;
}

function getPopularityScore(playCount) {
  // Convert play count to popularity score (0-100)
  if (playCount > 500000000) return 95 + Math.floor(Math.random() * 5);
  if (playCount > 200000000) return 85 + Math.floor(Math.random() * 10);
  if (playCount > 100000000) return 75 + Math.floor(Math.random() * 10);
  if (playCount > 50000000) return 65 + Math.floor(Math.random() * 10);
  if (playCount > 10000000) return 50 + Math.floor(Math.random() * 15);
  return 30 + Math.floor(Math.random() * 20);
}

async function addPlayCounts() {
  try {
    console.log('🎵 Adding play counts and popularity scores...\n');

    const dataPath = path.join(__dirname, '../data/musicData.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    for (const artist of jsonData.artists) {
      console.log(`Processing ${artist.name}...`);
      
      let songCount = 0;
      for (const song of artist.songs) {
        // Get album release year
        const album = artist.albums.find(a => a.title === song.albumName);
        const albumYear = album ? new Date(album.releaseDate).getFullYear() : 2020;
        
        // Generate play count
        const playCount = getRandomPlayCount(
          artist.name,
          song.trackNumber,
          albumYear
        );
        
        // Generate popularity score based on play count
        const popularity = getPopularityScore(playCount);
        
        song.playCount = playCount;
        song.popularity = popularity;
        songCount++;
      }
      
      console.log(`✅ Updated ${songCount} songs for ${artist.name}`);
    }

    // Save updated data
    fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2));
    
    console.log(`\n✅ Play counts and popularity scores added!`);
    console.log('Run "npm run seed" to update your database.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addPlayCounts();
