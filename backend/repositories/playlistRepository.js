import Playlist from '../models/Playlist.js';

class PlaylistRepository {
  /**
   * Get all playlists from the database
   * @param {boolean} populate - Whether to populate song references
   * @returns {Promise<Array>} Array of playlist documents
   */
  async findAll(populate = true) {
    const query = Playlist.find();
    if (populate) {
      return await query
        .populate('songs')
        .populate({ path: 'owner', select: 'username' });
    }
    return await query;
  }

  /**
   * Find a specific playlist by ID
   * @param {string} id - Playlist ObjectId
   * @param {boolean} populate - Whether to populate song references
   * @returns {Promise<Object|null>} Playlist document or null if not found
   */
  async findById(id, populate = true) {
    const query = Playlist.findById(id);
    if (populate) {
      return await query
        .populate({
          path: 'songs',
          populate: [
            { path: 'artist', select: 'name image' },
            { path: 'album', select: 'title coverImage' }
          ]
        })
        .populate({ path: 'owner', select: 'username' });
    }
    return await query;
  }

  /**
   * Create a new playlist
   * @param {Object} playlistData - Playlist data (name, description, createdBy, songs, etc.)
   * @returns {Promise<Object>} Created playlist document
   */
  async create(playlistData) {
    const playlist = new Playlist(playlistData);
    return await playlist.save();
  }

  /**
   * Update an existing playlist
   * @param {string} id - Playlist ObjectId
   * @param {Object} playlistData - Updated playlist fields
   * @returns {Promise<Object|null>} Updated playlist document or null
   */
  async update(id, playlistData) {
    return await Playlist.findByIdAndUpdate(
      id,
      playlistData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete a playlist by ID
   * @param {string} id - Playlist ObjectId
   * @returns {Promise<Object|null>} Deleted playlist document or null
   */
  async delete(id) {
    return await Playlist.findByIdAndDelete(id);
  }

  /**
   * Find all public playlists
   * @returns {Promise<Array>} Array of public playlists with populated songs
   */
  async findPublic() {
    return await Playlist.find({ isPublic: true })
      .populate('songs')
      .populate({ path: 'owner', select: 'username' });
  }

  /**
   * Find all playlists owned by a specific user
   * @param {string} userId - User ObjectId (owner)
   * @returns {Promise<Array>} Array of playlists with populated songs
   */
  async findByOwner(userId) {
    return await Playlist.find({ owner: userId })
      .populate('songs')
      .populate({ path: 'owner', select: 'username' })
      .sort({ createdAt: -1 });
  }

  /**
   * Add a song to a playlist (prevents duplicates)
   * @param {string} playlistId - Playlist ObjectId
   * @param {string} songId - Song ObjectId
   * @returns {Promise<Object|null>} Updated playlist with populated songs
   */
  async addSongToPlaylist(playlistId, songId) {
    return await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { songs: songId } },
      { new: true }
    ).populate('songs');
  }

  /**
   * Remove a song from a playlist
   * @param {string} playlistId - Playlist ObjectId
   * @param {string} songId - Song ObjectId
   * @returns {Promise<Object|null>} Updated playlist with populated songs
   */
  async removeSongFromPlaylist(playlistId, songId) {
    return await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { songs: songId } },
      { new: true }
    ).populate('songs');
  }

  /**
 * Add a follower to a playlist
 * @param {string} playlistId - Playlist ObjectId
 * @param {string} userId - User ObjectId
 * @returns {Promise<Object>} Updated playlist
 */
async addFollower(playlistId, userId) {
  return await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { followers: userId } },
    { new: true }
  );
}

/**
 * Remove a follower from a playlist
 * @param {string} playlistId - Playlist ObjectId
 * @param {string} userId - User ObjectId
 * @returns {Promise<Object>} Updated playlist
 */
async removeFollower(playlistId, userId) {
  return await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { followers: userId } },
    { new: true }
  );
}

async addCollaborator(playlistId, userId) {
  return await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { collaborators: userId } },
    { new: true }
  ).populate('collaborators', 'username email');
}

async removeCollaborator(playlistId, userId) {
  return await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { collaborators: userId } },
    { new: true }
  ).populate('collaborators', 'username email');
}
}

export default new PlaylistRepository();
