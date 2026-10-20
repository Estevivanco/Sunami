import Artist from '../models/Artist.js';

class ArtistRepository {
  /**
   * Get all artists from the database
   * @returns {Promise<Array>} Array med artistdokument
   */
  async findAll() {
    return await Artist.find();
  }

  /**
   * Find a specific artist by ID
   * @param {string} id - Artist ObjectId
   * @returns {Promise<Object|null>} Artistdokument eller null om inte hittat
   */
  async findById(id) {
    try {
      return await Artist.findById(id);
    } catch (error) {
      // Return null for invalid ObjectId format
      return null;
    }
  }

  /**
   * Find an artist by exact name
   * @param {string} name - Artistnamn
   * @returns {Promise<Object|null>} Artistdokument eller null
   */
  async findByName(name) {
    return await Artist.findOne({ name });
  }

  /**
   * Create a new artist
   * @param {Object} artistData - Artistdata (name, genre, country, image)
   * @returns {Promise<Object>} Created artist document
   */
  async create(artistData) {
    const artist = new Artist(artistData);
    return await artist.save();
  }

  /**
   * Update an existing artist
   * @param {string} id - Artist ObjectId
   * @param {Object} artistData - Updated artist fields
   * @returns {Promise<Object|null>} Updated artist document or null
   */
  async update(id, artistData) {
    return await Artist.findByIdAndUpdate(
      id,
      artistData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete an artist by ID
   * @param {string} id - Artist ObjectId
   * @returns {Promise<Object|null>} Deleted artist document or null
   */
  async delete(id) {
    return await Artist.findByIdAndDelete(id);
  }

  /**
   * Find artists by genre
   * @param {string} genre - Genrenamn
   * @returns {Promise<Array>} Array med artister
   */
  async findByGenre(genre) {
    return await Artist.find({ genres: genre }); // MongoDB will match if genre is in the genres array
  }

  /**
   * Find artists by country
   * @param {string} country - Landsnamn
   * @returns {Promise<Array>} Array med artister
   */
  async findByCountry(country) {
    return await Artist.find({ country });
  }
}

export default new ArtistRepository();
