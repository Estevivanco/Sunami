import Artist from '../models/Artist.js';

class ArtistRepository {
  /**
   * Hämta alla artister från databasen
   * @returns {Promise<Array>} Array med artistdokument
   */
  async findAll() {
    return await Artist.find();
  }

  /**
   * Hitta en specifik artist med ID
   * @param {string} id - Artist ObjectId
   * @returns {Promise<Object|null>} Artistdokument eller null om inte hittat
   */
  async findById(id) {
    return await Artist.findById(id);
  }

  /**
   * Hitta artist med exakt namn
   * @param {string} name - Artistnamn
   * @returns {Promise<Object|null>} Artistdokument eller null
   */
  async findByName(name) {
    return await Artist.findOne({ name });
  }

  /**
   * Skapa en ny artist
   * @param {Object} artistData - Artistdata (name, genre, country, image)
   * @returns {Promise<Object>} Skapat artistdokument
   */
  async create(artistData) {
    const artist = new Artist(artistData);
    return await artist.save();
  }

  /**
   * Uppdatera en befintlig artist
   * @param {string} id - Artist ObjectId
   * @param {Object} artistData - Uppdaterade artistfält
   * @returns {Promise<Object|null>} Uppdaterat artistdokument eller null
   */
  async update(id, artistData) {
    return await Artist.findByIdAndUpdate(
      id,
      artistData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Radera en artist med ID
   * @param {string} id - Artist ObjectId
   * @returns {Promise<Object|null>} Raderat artistdokument eller null
   */
  async delete(id) {
    return await Artist.findByIdAndDelete(id);
  }

  /**
   * Hitta artister efter genre
   * @param {string} genre - Genrenamn
   * @returns {Promise<Array>} Array med artister
   */
  async findByGenre(genre) {
    return await Artist.find({ genres: genre }); // MongoDB will match if genre is in the genres array
  }

  /**
   * Hitta artister efter land
   * @param {string} country - Landsnamn
   * @returns {Promise<Array>} Array med artister
   */
  async findByCountry(country) {
    return await Artist.find({ country });
  }
}

export default new ArtistRepository();
