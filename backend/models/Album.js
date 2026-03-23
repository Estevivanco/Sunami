import mongoose from 'mongoose';
import Song from './Song.js';

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  releaseDate: {
    type: Date
  },
  genres: {
    type: [String],
    default: []
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  totalTracks: {
    type: Number
  },
  coverImage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Pre-save hook - Validera att artist finns och uppdatera totalTracks
albumSchema.pre('save', async function(next) {
  try {
    // Förhindra ändring av artist på befintliga album
    if (!this.isNew && this.isModified('artist')) {
      return next(new Error('Cannot change artist of an existing album'));
    }

    // Kontrollera att artist finns (använd mongoose.model för att undvika cirkulärt beroende)
    const Artist = mongoose.model('Artist');
    const artist = await Artist.findById(this.artist);
    if (!artist) {
      throw new Error('Artist not found');
    }

    // Validera att låtar finns
    if (this.songs && this.songs.length > 0) {
      const songs = await Song.find({ _id: { $in: this.songs } });
      if (songs.length !== this.songs.length) {
        throw new Error('One or more songs not found');
      }
      this.totalTracks = this.songs.length;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save hook - Logga när album skapas/uppdateras
albumSchema.post('save', function(doc) {
  console.log(`Album saved: ${doc.title}`);
});

// Pre-remove hook - Logga före radering
albumSchema.pre('remove', function(next) {
  console.log(`Removing album: ${this.title}`);
  next();
});

// Pre-findOneAndDelete hook
albumSchema.pre('findOneAndDelete', async function(next) {
  console.log('Album is being deleted');
  next();
});

const Album = mongoose.model('Album', albumSchema);

export default Album