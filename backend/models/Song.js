import mongoose from 'mongoose';

// Song model
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
    type: Number, // in seconds
  },
  genres: {
    type: [String],
    default: []
  },
  previewUrl: {
    type: String  // 30-second preview from Spotify
  },
  spotifyUrl: {
    type: String  // link to the full track on Spotify
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

// Pre-save hook - Validate that duration is positive
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

// Pre-findOneAndDelete hook
songSchema.pre('findOneAndDelete', function(next) {
  next();
});

const Song = mongoose.model('Song', songSchema)

export default Song
