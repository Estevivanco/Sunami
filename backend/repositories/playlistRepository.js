import Playlist from '../models/Playlist.js';

class PlaylistRepository {
  /**
   * Hämta alla spellistor från databasen
   * @param {boolean} populate - Om songs-referenser ska populeras
   * @returns {Promise<Array>} Array med spellistdokument
   */
  async findAll(populate = true) {
    const query = Playlist.find();
    if (populate) {
      return await query.populate('songs');
    }
    return await query;
  }

  /**
   * Hitta en specifik spellista med ID
   * @param {string} id - Playlist ObjectId
   * @param {boolean} populate - Om songs-referenser ska populeras
   * @returns {Promise<Object|null>} Spellistdokument eller null om inte hittat
   */
  async findById(id, populate = true) {
    const query = Playlist.findById(id);
    if (populate) {
      return await query.populate({
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
   * Skapa en ny spellista
   * @param {Object} playlistData - Spellistdata (name, description, createdBy, songs, etc.)
   * @returns {Promise<Object>} Skapat spellistdokument
   */
  async create(playlistData) {
    const playlist = new Playlist(playlistData);
    return await playlist.save();
  }

  /**
   * Uppdatera en befintlig spellista
   * @param {string} id - Playlist ObjectId
   * @param {Object} playlistData - Uppdaterade spellistfält
   * @returns {Promise<Object|null>} Uppdaterat spellistdokument eller null
   */
  async update(id, playlistData) {
    return await Playlist.findByIdAndUpdate(
      id,
      playlistData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Radera en spellista med ID
   * @param {string} id - Playlist ObjectId
   * @returns {Promise<Object|null>} Raderat spellistdokument eller null
   */
  async delete(id) {
    return await Playlist.findByIdAndDelete(id);
  }

  /**
   * Hitta alla spellistor skapade av en specifik användare
   * @param {string} createdBy - User ID (skapare)
   * @returns {Promise<Array>} Array med spellistor med populerade songs
   */
  async findByCreator(createdBy) {
    return await Playlist.find({ createdBy }).populate('songs');
  }

  /**
   * Hitta alla publika spellistor
   * @returns {Promise<Array>} Array med publika spellistor med populerade songs
   */
  async findPublic() {
    return await Playlist.find({ isPublic: true }).populate('songs');
  }

  /**
   * Hitta alla spellistor ägda av en specifik användare
   * @param {string} userId - User ObjectId (owner)
   * @returns {Promise<Array>} Array med spellistor med populerade songs
   */
  async findByOwner(userId) {
    return await Playlist.find({ owner: userId }).populate('songs').sort({ createdAt: -1 });
  }

  /**
   * Lägg till en låt i en spellista (förhindrar dubbletter)
   * @param {string} playlistId - Playlist ObjectId
   * @param {string} songId - Song ObjectId
   * @returns {Promise<Object|null>} Uppdaterad spellista med populerade songs
   */
  async addSongToPlaylist(playlistId, songId) {
    return await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { songs: songId } },
      { new: true }
    ).populate('songs');
  }

  /**
   * Ta bort en låt från en spellista
   * @param {string} playlistId - Playlist ObjectId
   * @param {string} songId - Song ObjectId
   * @returns {Promise<Object|null>} Uppdaterad spellista med populerade songs
   */
  async removeSongFromPlaylist(playlistId, songId) {
    return await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { songs: songId } },
      { new: true }
    ).populate('songs');
  }
}

export default new PlaylistRepository();
