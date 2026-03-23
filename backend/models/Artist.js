import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  genres: {
    type: [String],
    default: []
  },
  country: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  },
  monthlyListeners: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save hook - Kontrollera för dubbletter och sätt stor bokstav
artistSchema.pre('save', async function(next) {
  try {
    // Sätt stor bokstav på första bokstaven
    if (this.name) {
      this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    }

    // Kontrollera för dubbletter av artistnamn (endast på nya dokument)
    if (this.isNew) {
      const existingArtist = await mongoose.models.Artist.findOne({ name: this.name });
      if (existingArtist) {
        throw new Error(`Artist with name "${this.name}" already exists`);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save hook - Logga när artist skapas/uppdateras
artistSchema.post('save', function(doc) {
  console.log(`Artist saved: ${doc.name}`);
});

// Pre-remove hook - Kontrollera album före radering
// Pre-remove hook - Kontrollera album före radering
artistSchema.pre('remove', async function(next) {
  try {
    // Använd mongoose.model för att undvika cirkulärt beroende
    const Album = mongoose.model('Album');
    const albums = await Album.countDocuments({ artist: this._id });
    if (albums > 0) {
      throw new Error(`Cannot delete artist. ${albums} album(s) exist for this artist`);
    }
    console.log(`Removing artist: ${this.name}`);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-findOneAndDelete hook - Kontrollera album
artistSchema.pre('findOneAndDelete', async function(next) {
  try {
    const artist = await this.model.findOne(this.getFilter());
    if (artist) {
      // Använd mongoose.model för att undvika cirkulärt beroende
      const Album = mongoose.model('Album');
      const albums = await Album.countDocuments({ artist: artist._id });
      if (albums > 0) {
        throw new Error(`Cannot delete artist. ${albums} album(s) exist for this artist`);
      }
    }
    console.log('Artist is being deleted');
    next();
  } catch (error) {
    next(error);
  }
});
const Artist =  mongoose.model('Artist', artistSchema);

export default Artist
