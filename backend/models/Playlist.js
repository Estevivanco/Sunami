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
    ref: 'Users'
  }],
  isSystemPlaylist: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook - Validera att låtar finns och sätt standardnamn
playlistSchema.pre('save', async function(next) {
  try {
    // Sätt standardnamn om tomt
    if (!this.name || this.name.trim() === '') {
      this.name = 'Untitled Playlist';
    }

    // Validera att alla låtar finns
    if (this.songs && this.songs.length > 0) {
      const validSongs = await Song.find({ _id: { $in: this.songs } });
      
      // Ta bort ogiltiga låtreferenser
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

// Post-save hook - Logga när spellista skapas/uppdateras
playlistSchema.post('save', function(doc) {
  console.log(`Playlist saved: ${doc.name} (${doc.songs.length} songs)`);
});

// Pre-remove hook - Logga före radering
playlistSchema.pre('remove', function(next) {
  console.log(`Removing playlist: ${this.name}`);
  next();
});

// Pre-findOneAndDelete hook
playlistSchema.pre('findOneAndDelete', function(next) {
  console.log('Playlist is being deleted');
  next();
});

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist
