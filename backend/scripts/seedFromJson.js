import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Song from '../models/Song.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seed database from musicData.json
 * Run with: npm run seed:custom
 */
async function seedFromJson() {
  try {
    console.log('🎵 Starting custom data seeding...\n');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Song.deleteMany();
    await Album.deleteMany();
    await Artist.deleteMany();
    console.log('✅ Existing data cleared\n');

    // Load JSON data
    const dataPath = path.join(__dirname, '../data/musicData.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    let totalArtists = 0;
    let totalAlbums = 0;
    let totalSongs = 0;

    // Process each artist
    for (const artistData of jsonData.artists) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🔍 Processing: ${artistData.name}`);
      console.log('='.repeat(50));

      // Save artist
      const savedArtist = await Artist.create({
        name: artistData.name,
        genres: artistData.genres || [],
        country: 'Unknown',
        image: artistData.image,
        bio: artistData.bio || '',
        verified: artistData.verified || false,
        monthlyListeners: artistData.monthlyListeners || 0,
        followers: artistData.followers || 0
      });
      console.log(`✅ Artist saved: ${savedArtist.name}`);
      totalArtists++;

      // Save albums
      const savedAlbums = await Album.insertMany(
        artistData.albums.map(album => ({
          title: album.title,
          artist: savedArtist._id,
          releaseDate: new Date(album.releaseDate),
          coverImage: album.coverImage
        }))
      );
      console.log(`✅ Saved ${savedAlbums.length} albums`);
      totalAlbums += savedAlbums.length;

      // Map album names to IDs
      const albumMap = {};
      savedAlbums.forEach(album => {
        albumMap[album.title] = album._id;
      });

      // Save songs
      const savedSongs = await Song.insertMany(
        artistData.songs.map(song => ({
          title: song.title,
          duration: song.duration,
          genres: artistData.genres || [],
          artist: savedArtist._id,
          album: albumMap[song.albumName],
          previewUrl: song.previewUrl || null,
          spotifyUrl: song.spotifyUrl,
          playCount: song.playCount || 0,
          popularity: song.popularity || 0
        }))
      );
      console.log(`✅ Saved ${savedSongs.length} songs`);
      totalSongs += savedSongs.length;

      // Update albums with song IDs
      for (const song of savedSongs) {
        if (song.album) {
          await Album.findByIdAndUpdate(
            song.album,
            { $push: { songs: song._id } }
          );
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE SEEDING COMPLETE!');
    console.log('='.repeat(50));
    console.log(`📊 Total Artists: ${totalArtists}`);
    console.log(`📀 Total Albums: ${totalAlbums}`);
    console.log(`🎵 Total Songs: ${totalSongs}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
    process.exit(0);
  }
}

seedFromJson();
