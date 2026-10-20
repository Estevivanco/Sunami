import Album from '../models/Album.js';

class AlbumRepository {
  /**
   * Get all albums from the database
   * @param {string|boolean} populate - 'artist' to populate only the artist, true for everything, false for nothing
   * @returns {Promise<Array>} Array med albumdokument
   */
  async findAll(populate = true) {
    const query = Album.find();
    if (populate === 'artist') {
      return await query.populate('artist'); // Populate only the artist, keep songs as IDs
    } else if (populate === true) {
      return await query.populate('artist').populate('songs'); // Populera allt
    }
    return await query; // Ingen populering
  }

  /**
   * Find a specific album by its ID
   * @param {string} id - Album ObjectId
   * @param {boolean} populate - Om artist- och songs-referenser ska populeras
   * @returns {Promise<Object|null>} Albumdokument eller null om inte hittat
   */
  async findById(id, populate = true) {
    const query = Album.findById(id);
    if (populate) {
      return await query
        .populate('artist')
        .populate({
          path: 'songs',
          populate: [
            { path: 'artist', select: 'name image' },
            { path: 'album', select: 'title coverImage' }
          ]
        });
    }
    return await query;
  }

  /**
   * Create a new album
   * @param {Object} albumData - Albumdata (title, artist, releaseYear, genre, etc.)
   * @returns {Promise<Object>} Created album document
   */
  async create(albumData) {
    const album = new Album(albumData);
    return await album.save();
  }

  /**
   * Update an existing album
   * @param {string} id - Album ObjectId
   * @param {Object} albumData - Updated album fields
   * @returns {Promise<Object|null>} Updated album document or null
   */
  async update(id, albumData) {
    return await Album.findByIdAndUpdate(
      id,
      albumData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete an album by ID
   * @param {string} id - Album ObjectId
   * @returns {Promise<Object|null>} Deleted album document or null
   */
  async delete(id) {
    return await Album.findByIdAndDelete(id);
  }

  /**
   * Find all albums by a specific artist
   * @param {string} artistId - Artist ObjectId
   * @returns {Promise<Array>} Array med album med populerad artist och songs
   */
  async findByArtist(artistId) {
    return await Album.find({ artist: artistId }).populate('artist').populate('songs');
  }

  /**
   * Find albums by genre
   * @param {string} genre - Genrenamn
   * @returns {Promise<Array>} Array med album med populerad artist
   */
  async findByGenre(genre) {
    return await Album.find({ genres: genre }).populate('artist'); // MongoDB will match if genre is in the genres array
  }

  /**
   * Count total albums per artist
   * @param {string} artistId - Artist ObjectId
   * @returns {Promise<number>} Antal album
   */
  async countByArtist(artistId) {
    return await Album.countDocuments({ artist: artistId });
  }
}

export default new AlbumRepository();
