import Song from '../models/Song.js';

class SongRepository {
  /**
   * Get all songs from the database with populated artist
   * @returns {Promise<Array>} Array of song documents
   */
  async findAll() {
    return await Song.find()
      .populate('artist')
      .populate('album');
  }

  /**
   * Find a specific song by ID
   * @param {string} id - Song ObjectId
   * @returns {Promise<Object|null>} Song document with populated artist or null
   */
  async findById(id) {
    return await Song.findById(id)
      .populate('artist')
      .populate('album');
  }

  /**
   * Create a new song
   * @param {Object} songData - Song data (title, artist, album, duration, genre, etc.)
   * @returns {Promise<Object>} Created song document
   */
  async create(songData) {
    const song = new Song(songData);
    return await song.save();
  }

  /**
   * Update an existing song
   * @param {string} id - Song ObjectId
   * @param {Object} songData - Updated song fields
   * @returns {Promise<Object|null>} Updated song document or null
   */
  async update(id, songData) {
    return await Song.findByIdAndUpdate(
      id,
      songData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete a song by ID
   * @param {string} id - Song ObjectId
   * @returns {Promise<Object|null>} Deleted song document or null
   */
  async delete(id) {
    return await Song.findByIdAndDelete(id);
  }

  /**
   * Find songs by artist name (legacy method)
   * @param {string} artistName - Artistnamn
   * @returns {Promise<Array>} Array of songs
   */
  async findByArtist(artistName) {
    return await Song.find({ artist: artistName });
  }

  /**
   * Find all songs by artist ID
   * @param {string} artistId - Artist ObjectId
   * @returns {Promise<Array>} Array of songs with populated artist, sorted by playCount
   */
  async findByArtistId(artistId) {
    return await Song.find({ artist: artistId })
      .populate('artist')
      .populate('album')
      .sort({ playCount: -1 }); // Sort by playCount descending (most popular first)
  }

  /**
   * Search songs by artist with optional title filter
   * @param {string} artistId - Artist ObjectId
   * @param {string} searchQuery - Optional search query for song title (case-insensitive)
   * @returns {Promise<Array>} Array of matching songs with populated artist, sorted by playCount
   */
  async searchByArtist(artistId, searchQuery = '') {
    const filter = { artist: artistId };
    
    // If a search query is given, add title search (case-insensitive)
    if (searchQuery) {
      filter.title = { $regex: searchQuery, $options: 'i' };
    }
    
    return await Song.find(filter)
      .populate('artist')
      .populate('album')
      .sort({ playCount: -1 }); // Sort by playCount descending (most popular first)
  }

  /**
   * Find songs by genre
   * @param {string} genre - Genrenamn
   * @returns {Promise<Array>} Array of songs
   */
  async findByGenre(genre) {
    return await Song.find({ genres: genre }); // MongoDB will match if genre is in the genres array
  }

  /**
   * Global song search (title and genre)
   * @param {string} searchQuery - Search term (case-insensitive)
   * @returns {Promise<Array>} Array of matching songs with populated artist
   */
  async search(searchQuery) {
    // Search title, artist name or genre
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
