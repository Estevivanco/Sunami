import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Add proper genres to artists
 * Run with: node backend/scripts/addGenres.js
 */

const artistGenres = {
  'Bad Bunny': ['reggaeton', 'trap latino', 'latin', 'urbano latino'],
  'Taylor Swift': ['pop', 'country', 'indie folk', 'alternative'],
  'The Weeknd': ['r&b', 'pop', 'alternative r&b', 'electronic'],
  'Drake': ['hip hop', 'rap', 'r&b', 'canadian hip hop'],
  'Feid': ['reggaeton', 'latin pop', 'urbano latino', 'trap'],
  'Bruno Mars': ['pop', 'r&b', 'funk', 'soul'],
  'Ariana Grande': ['pop', 'r&b', 'dance pop'],
  'Olivia Rodrigo': ['pop', 'rock', 'alternative', 'pop punk'],
  'Sabrina Carpenter': ['pop', 'dance pop', 'electropop'],
  'Ed Sheeran': ['pop', 'folk', 'acoustic', 'singer-songwriter'],
  'Lil Baby': ['hip hop', 'trap', 'rap', 'atlanta hip hop']
};

async function addGenres() {
  try {
    console.log('🎵 Adding genres to artists...\n');

    const dataPath = path.join(__dirname, '../data/musicData.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    for (const artist of jsonData.artists) {
      if (artistGenres[artist.name]) {
        artist.genres = artistGenres[artist.name];
        console.log(`✅ ${artist.name}: ${artist.genres.join(', ')}`);
      }
    }

    // Save updated data
    fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2));
    
    console.log(`\n✅ Genres added to all artists!`);
    console.log('Run "npm run seed" to update your database.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addGenres();
