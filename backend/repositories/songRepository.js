import Song from '../models/Song.js';

class SongRepository {
  /**
   * Hämta alla låtar från databasen med populerad artist
   * @returns {Promise<Array>} Array med låtdokument
   */
  async findAll() {
    return await Song.find()
      .populate('artist')
      .populate('album');
  }

  /**
   * Hitta en specifik låt med ID
   * @param {string} id - Song ObjectId
   * @returns {Promise<Object|null>} Låtdokument med populerad artist eller null
   */
  async findById(id) {
    return await Song.findById(id)
      .populate('artist')
      .populate('album');
  }

  /**
   * Skapa en ny låt
   * @param {Object} songData - Låtdata (title, artist, album, duration, genre, etc.)
   * @returns {Promise<Object>} Skapat låtdokument
   */
  async create(songData) {
    const song = new Song(songData);
    return await song.save();
  }

  /**
   * Uppdatera en befintlig låt
   * @param {string} id - Song ObjectId
   * @param {Object} songData - Uppdaterade låtfält
   * @returns {Promise<Object|null>} Uppdaterat låtdokument eller null
   */
  async update(id, songData) {
    return await Song.findByIdAndUpdate(
      id,
      songData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Radera en låt med ID
   * @param {string} id - Song ObjectId
   * @returns {Promise<Object|null>} Raderat låtdokument eller null
   */
  async delete(id) {
    return await Song.findByIdAndDelete(id);
  }

  /**
   * Hitta låtar efter artistnamn (äldre metod)
   * @param {string} artistName - Artistnamn
   * @returns {Promise<Array>} Array med låtar
   */
  async findByArtist(artistName) {
    return await Song.find({ artist: artistName });
  }

  /**
   * Hitta alla låtar efter artist-ID
   * @param {string} artistId - Artist ObjectId
   * @returns {Promise<Array>} Array med låtar med populerad artist, sorterade efter playCount
   */
  async findByArtistId(artistId) {
    return await Song.find({ artist: artistId })
      .populate('artist')
      .populate('album')
      .sort({ playCount: -1 }); // Sort by playCount descending (most popular first)
  }

  /**
   * Sök låtar efter artist med valfritt titelfilter
   * @param {string} artistId - Artist ObjectId
   * @param {string} searchQuery - Valfri sökfråga för låttitel (skiftlägesokänslig)
   * @returns {Promise<Array>} Array med matchande låtar med populerad artist, sorterade efter playCount
   */
  async searchByArtist(artistId, searchQuery = '') {
    const filter = { artist: artistId };
    
    // Om sökfråga angiven, lägg till titelsökning (skiftlägesokänslig)
    if (searchQuery) {
      filter.title = { $regex: searchQuery, $options: 'i' };
    }
    
    return await Song.find(filter)
      .populate('artist')
      .populate('album')
      .sort({ playCount: -1 }); // Sort by playCount descending (most popular first)
  }

  /**
   * Hitta låtar efter genre
   * @param {string} genre - Genrenamn
   * @returns {Promise<Array>} Array med låtar
   */
  async findByGenre(genre) {
    return await Song.find({ genres: genre }); // MongoDB will match if genre is in the genres array
  }

  /**
   * Global sökning över låtar (titel och genre)
   * @param {string} searchQuery - Sökterm (skiftlägesokänslig)
   * @returns {Promise<Array>} Array med matchande låtar med populerad artist
   */
  async search(searchQuery) {
    // Sök i titel, artistnamn eller genre
    return await Song.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { genres: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .populate('artist')
      .populate('album');
  }
}

export default new SongRepository();
