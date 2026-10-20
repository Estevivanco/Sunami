import mongoose from 'mongoose';
import Song from './Song.js';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isSystemPlaylist: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook - Validate that songs exist and set default name
playlistSchema.pre('save', async function(next) {
  try {
    // Set default name if empty
    if (!this.name || this.name.trim() === '') {
      this.name = 'Untitled Playlist';
    }

    // Validate that all songs exist
    if (this.songs && this.songs.length > 0) {
      const validSongs = await Song.find({ _id: { $in: this.songs } });

      // Remove invalid song references
      const validSongIds = validSongs.map(song => song._id.toString());
      this.songs = this.songs.filter(songId => 
        validSongIds.includes(songId.toString())
      );
      
      if (validSongs.length === 0 && this.songs.length > 0) {
        console.warn('Warning: Some songs in playlist were not found and removed');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist
