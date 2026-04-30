import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';
import User from '../models/User.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';

dotenv.config();

/**
 * Create curated playlists for Sunami
 * These are admin-only playlists organized by genre
 */
async function createCuratedPlaylists() {
  try {
    console.log('🎵 Creating Sunami curated playlists...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Admin user not found. Please run npm run seed:admin first');
      process.exit(1);
    }

    // Delete existing curated playlists
    await Playlist.deleteMany({ owner: admin._id, isSystemPlaylist: true});
    console.log('🗑️  Cleared existing curated playlists\n');

    // Get all songs
    const allSongs = await Song.find().populate('artist');
    console.log(`📊 Found ${allSongs.length} total songs\n`);

    // Categorize songs by genre
    const genreCategories = {
      urban: ['urban', 'afrobeat', 'dancehall', 'reggaeton', 'latin'],
      hiphop: ['hip hop', 'rap', 'trap', 'drill'],
      pop: ['pop', 'dance pop', 'electropop', 'indie pop', 'synth-pop'],
      rnb: ['r&b', 'soul', 'neo soul', 'contemporary r&b']
    };

    const categorizedSongs = {
      urban: [],
      hiphop: [],
      pop: [],
      rnb: []
    };

    // Categorize each song
    allSongs.forEach(song => {
      if (!song.genres || song.genres.length === 0) return;

      const songGenres = song.genres.map(g => g.toLowerCase());
      
      // Check each category
      for (const [category, keywords] of Object.entries(genreCategories)) {
        const matches = songGenres.some(genre => 
          keywords.some(keyword => genre.includes(keyword))
        );
        
        if (matches) {
          categorizedSongs[category].push(song);
        }
      }
    });

    // Log categorization results
    console.log('📊 Song categorization:');
    console.log(`   Urban: ${categorizedSongs.urban.length} songs`);
    console.log(`   Hip-Hop/Rap: ${categorizedSongs.hiphop.length} songs`);
    console.log(`   Pop: ${categorizedSongs.pop.length} songs`);
    console.log(`   R&B: ${categorizedSongs.rnb.length} songs\n`);

    // Playlist configurations
    const playlistConfigs = [
      {
        name: '🌴 Urban Vibes',
        description: 'The hottest urban, afrobeat, and reggaeton tracks',
        songs: categorizedSongs.urban.slice(0, 50),
        category: 'Urban'
      },
      {
        name: '🎤 Hip-Hop & Rap',
        description: 'Fire bars and fresh beats from the rap game',
        songs: categorizedSongs.hiphop.slice(0, 50),
        category: 'Hip-Hop'
      },
      {
        name: '✨ Pop Hits',
        description: 'The biggest pop anthems and chart-toppers',
        songs: categorizedSongs.pop.slice(0, 50),
        category: 'Pop'
      },
      {
        name: '💫 R&B Soul',
        description: 'Smooth R&B and soulful vibes',
        songs: categorizedSongs.rnb.slice(0, 50),
        category: 'R&B'
      }
    ];

    // Create playlists
    const createdPlaylists = [];
    for (const config of playlistConfigs) {
      if (config.songs.length === 0) {
        console.log(`⚠️  Skipping ${config.name} - no songs found`);
        continue;
      }

      const playlist = await Playlist.create({
        name: config.name,
        description: config.description,
        owner: admin._id,
        songs: config.songs.map(s => s._id),
        isPublic: true,
        isSystemPlaylist: true
      });

      createdPlaylists.push(playlist);
      console.log(`✅ Created "${config.name}" with ${config.songs.length} songs`);
    }

    console.log(`\n🎉 Successfully created ${createdPlaylists.length} curated playlists!`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createCuratedPlaylists();
