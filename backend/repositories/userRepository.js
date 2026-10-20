import User from '../models/User.js';

class UserRepository {
  /**
   * Get all users from the database (password excluded by default)
   * @returns {Promise<Array>} Array of user documents
   */
  async findAll() {
    return await User.find();
  }

  /**
   * Find a specific user by ID (password excluded)
   * @param {string} id - User ObjectId
   * @returns {Promise<Object|null>} User document or null if not found
   */
  async findById(id) {
    return await User.findById(id);
  }

  /**
   * Find user by email (password excluded)
   * @param {string} email - User's email (case-insensitive)
   * @returns {Promise<Object|null>} User document or null
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by username (password excluded)
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User document or null
   */
  async findByUsername(username) {
    return await User.findOne({ username });
  }

  async searchByUsername(query) {
    return await User.find(
      { username: { $regex: query, $options: 'i' } },
      { _id: 1, username: 1 }
    ).limit(10);
  }

  /**
   * Find user by email with password included (for authentication)
   * @param {string} email - User's email (case-insensitive)
   * @returns {Promise<Object|null>} User document with password or null
   */
  async findByEmailWithPassword(email) {
    return await User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  /**
   * Find user by username with password included (for authentication)
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User document with password or null
   */
  async findByUsernameWithPassword(username) {
    return await User.findOne({ username }).select('+password');
  }

  /**
   * Create a new user
   * @param {Object} userData - User data (username, email, password, role)
   * @returns {Promise<Object>} Created user document
   */
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Update an existing user
   * @param {string} id - User ObjectId
   * @param {Object} userData - Updated user fields
   * @returns {Promise<Object|null>} Updated user document or null
   */
  async update(id, userData) {
    return await User.findByIdAndUpdate(
      id,
      userData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete a user by ID
   * @param {string} id - User ObjectId
   * @returns {Promise<Object|null>} Deleted user document or null
   */
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  /**
   * Check whether a user exists with the given email or username
   * @param {string} email - User's email
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User document if it exists, otherwise null
   */
  async exists(email, username) {
    return await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username }
      ]
    });
  }

  /**
   * Update a user's password (triggers bcrypt hashing via model middleware)
   * @param {string} id - User ObjectId
   * @param {string} newPassword - New plain-text password (will be hashed)
   * @returns {Promise<Object|null>} Updated user document or null
   */
  async updatePassword(id, newPassword) {
    const user = await User.findById(id);
    if (!user) return null;
    
    user.password = newPassword;
    return await user.save();
  }

  /**
   * Count the total number of users in the database
   * @returns {Promise<number>} Number of users
   */
  async countUsers() {
    return await User.countDocuments();
  }

  /**
   * Add a song to the user's liked songs
   * @param {string} userId - User ObjectId
   * @param {string} songId - Song ObjectId
   * @returns {Promise<Object>} Updated user document
   */
  async likeSong(userId, songId) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { likedSongs: songId } },
      { new: true }
    ).populate('likedSongs');
  }

  /**
   * Remove a song from the user's liked songs
   * @param {string} userId - User ObjectId
   * @param {string} songId - Song ObjectId
   * @returns {Promise<Object>} Updated user document
   */
  async unlikeSong(userId, songId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { likedSongs: songId } },
      { new: true }
    ).populate('likedSongs');
  }

  /**
   * Add an album to the user's saved albums
   * @param {string} userId - User ObjectId
   * @param {string} albumId - Album ObjectId
   * @returns {Promise<Object>} Updated user document
   */
  async saveAlbum(userId, albumId) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedAlbums: albumId } },
      { new: true }
    ).populate('savedAlbums');
  }

  /**
   * Remove an album from the user's saved albums
   * @param {string} userId - User ObjectId
   * @param {string} albumId - Album ObjectId
   * @returns {Promise<Object>} Updated user document
   */
  async unsaveAlbum(userId, albumId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { savedAlbums: albumId } },
      { new: true }
    ).populate('savedAlbums');
  }

  /**
   * Follow an artist
   * @param {string} userId - User ObjectId
   * @param {string} artistId - Artist ObjectId
   * @returns {Promise<Object>} Updated user document
   */
  async followArtist(userId, artistId) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { followedArtists: artistId } },
      { new: true }
    ).populate('followedArtists');
  }

  /**
   * Unfollow an artist
   * @param {string} userId - User ObjectId
   * @param {string} artistId - Artist ObjectId
   * @returns {Promise<Object>} Updated user document
   */
  async unfollowArtist(userId, artistId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { followedArtists: artistId } },
      { new: true }
    ).populate('followedArtists');
  }

  /**
   * Get the user's library (liked songs, saved albums, followed artists)
   * @param {string} userId - User ObjectId
   * @returns {Promise<Object>} User document with populated library fields
   */
  async getUserLibrary(userId) {
    return await User.findById(userId)
      .populate({
        path: 'likedSongs',
        populate: [
          { path: 'artist', select: 'name image' },
          { path: 'album', select: 'title coverImage' }
        ]
      })
      .populate({
        path: 'savedAlbums',
        populate: { path: 'artist', select: 'name' }
      })
      .populate('followedArtists')
      .populate({
        path: 'followedPlaylists',
        populate: [
          {
            path: 'songs',
            populate: [
              { path: 'artist', select: 'name image' },
              { path: 'album', select: 'title coverImage' }
            ]
          }
        ]
      })
  }

    /**
   * Follow a playlist
   * @param {string} userId - User ObjectId
   * @param {string} playlistId - Playlist ObjectId
   * @returns {Promise<Object>} Updated user document
   */
  async addFollowedPlaylist(userId, playlistId) {
    return await User.findByIdAndUpdate(
      userId,
      {$addToSet: {followedPlaylists: playlistId}},
      {new: true}
    ).populate('followedPlaylists')
  }
      /**
   * Unfollow a playlist
   * @param {string} userId - User ObjectId
   * @param {string} playlistId - Playlist ObjectId
   * @returns {Promise<Object>} Updated user document
   */
  async removeFollowedPlaylist(userId, playlistId){
     return await User.findByIdAndUpdate(
      userId,
      { $pull: {followedPlaylists: playlistId}},
      {new: true}
     ).populate('followedPlaylists')
  }
   
  
}

export default new UserRepository();