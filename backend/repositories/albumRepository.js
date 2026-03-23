import Album from '../models/Album.js';

class AlbumRepository {
  /**
   * Hämta alla album från databasen
   * @param {string|boolean} populate - 'artist' för att endast populera artist, true för allt, false för inget
   * @returns {Promise<Array>} Array med albumdokument
   */
  async findAll(populate = true) {
    const query = Album.find();
    if (populate === 'artist') {
      return await query.populate('artist'); // Populera endast artist, behåll songs som ID:n
    } else if (populate === true) {
      return await query.populate('artist').populate('songs'); // Populera allt
    }
    return await query; // Ingen populering
  }

  /**
   * Hitta ett specifikt album med dess ID
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
   * Skapa ett nytt album
   * @param {Object} albumData - Albumdata (title, artist, releaseYear, genre, etc.)
   * @returns {Promise<Object>} Skapat albumdokument
   */
  async create(albumData) {
    const album = new Album(albumData);
    return await album.save();
  }

  /**
   * Uppdatera ett befintligt album
   * @param {string} id - Album ObjectId
   * @param {Object} albumData - Uppdaterade albumfält
   * @returns {Promise<Object|null>} Uppdaterat albumdokument eller null
   */
  async update(id, albumData) {
    return await Album.findByIdAndUpdate(
      id,
      albumData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Radera ett album med ID
   * @param {string} id - Album ObjectId
   * @returns {Promise<Object|null>} Raderat albumdokument eller null
   */
  async delete(id) {
    return await Album.findByIdAndDelete(id);
  }

  /**
   * Hitta alla album av en specifik artist
   * @param {string} artistId - Artist ObjectId
   * @returns {Promise<Array>} Array med album med populerad artist och songs
   */
  async findByArtist(artistId) {
    return await Album.find({ artist: artistId }).populate('artist').populate('songs');
  }

  /**
   * Hitta album efter genre
   * @param {string} genre - Genrenamn
   * @returns {Promise<Array>} Array med album med populerad artist
   */
  async findByGenre(genre) {
    return await Album.find({ genres: genre }).populate('artist'); // MongoDB will match if genre is in the genres array
  }

  /**
   * Räkna totalt antal album per artist
   * @param {string} artistId - Artist ObjectId
   * @returns {Promise<number>} Antal album
   */
  async countByArtist(artistId) {
    return await Album.countDocuments({ artist: artistId });
  }
}

export default new AlbumRepository();
