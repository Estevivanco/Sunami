import mongoose from 'mongoose';

// Exempel: Song model
const songSchema = new mongoose.Schema({
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
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  },
  duration: {
    type: Number, // i sekunder
  },
  genres: {
    type: [String],
    default: []
  },
  previewUrl: {
    type: String  // 30 sek preview från Spotify
  },
  spotifyUrl: {
    type: String  // länk till hela låten i Spotify
  },
  playCount: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Pre-save hook - Validera att duration är positiv
songSchema.pre('save', function(next) {
  if (this.duration && this.duration < 0) {
    this.duration = 0;
  }
  next();
});

songSchema.pre('save', async function (next) {
    if(!this.album) return next()

    const Album = mongoose.model('Album')

    const album = await Album.findById(this.album)

    if(!album){
        return next(new Error('Album does not exist'))
    }

    if(!album.artist.equals(this.artist)){
        return next(new Error('Album does not belong to this artist'))
    }
})

// Post-save hook - Logga när låt skapas/uppdateras
songSchema.post('save', function(doc) {
  console.log(`Song saved: ${doc.title} by ${doc.artist}`);
});

// Pre-remove hook - Logga före radering
songSchema.pre('remove', function(next) {
  console.log(`Removing song: ${this.title}`);
  next();
});

// Pre-findOneAndDelete hook
songSchema.pre('findOneAndDelete', function(next) {
  console.log('Song is being deleted');
  next();
});

const Song = mongoose.model('Song', songSchema)

export default Song
