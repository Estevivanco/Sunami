import User from '../models/User.js';

class UserRepository {
  /**
   * Hämta alla användare från databasen (lösenord exkluderat som standard)
   * @returns {Promise<Array>} Array med användardokument
   */
  async findAll() {
    return await User.find();
  }

  /**
   * Hitta en specifik användare med ID (lösenord exkluderat)
   * @param {string} id - User ObjectId
   * @returns {Promise<Object|null>} Användardokument eller null om inte hittat
   */
  async findById(id) {
    return await User.findById(id);
  }

  /**
   * Hitta användare med email (lösenord exkluderat)
   * @param {string} email - Användarens email (skiftlägesokänslig)
   * @returns {Promise<Object|null>} Användardokument eller null
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Hitta användare med användarnamn (lösenord exkluderat)
   * @param {string} username - Användarnamn
   * @returns {Promise<Object|null>} Användardokument eller null
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
   * Hitta användare med email med lösenord inkluderat (för autentisering)
   * @param {string} email - Användarens email (skiftlägesokänslig)
   * @returns {Promise<Object|null>} Användardokument med lösenord eller null
   */
  async findByEmailWithPassword(email) {
    return await User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  /**
   * Hitta användare med användarnamn med lösenord inkluderat (för autentisering)
   * @param {string} username - Användarnamn
   * @returns {Promise<Object|null>} Användardokument med lösenord eller null
   */
  async findByUsernameWithPassword(username) {
    return await User.findOne({ username }).select('+password');
  }

  /**
   * Skapa en ny användare
   * @param {Object} userData - Användardata (username, email, password, role)
   * @returns {Promise<Object>} Skapat användardokument
   */
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Uppdatera en befintlig användare
   * @param {string} id - User ObjectId
   * @param {Object} userData - Uppdaterade användarfält
   * @returns {Promise<Object|null>} Uppdaterat användardokument eller null
   */
  async update(id, userData) {
    return await User.findByIdAndUpdate(
      id,
      userData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Radera en användare med ID
   * @param {string} id - User ObjectId
   * @returns {Promise<Object|null>} Raderat användardokument eller null
   */
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  /**
   * Kontrollera om användare finns med email eller användarnamn
   * @param {string} email - Användarens email
   * @param {string} username - Användarnamn
   * @returns {Promise<Object|null>} Användardokument om finns, annars null
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
   * Uppdatera användares lösenord (aktiverar bcrypt-hashning via modell-middleware)
   * @param {string} id - User ObjectId
   * @param {string} newPassword - Nytt lösenord i klartext (kommer att hashas)
   * @returns {Promise<Object|null>} Uppdaterat användardokument eller null
   */
  async updatePassword(id, newPassword) {
    const user = await User.findById(id);
    if (!user) return null;
    
    user.password = newPassword;
    return await user.save();
  }

  /**
   * Räkna totalt antal användare i databasen
   * @returns {Promise<number>} Antal användare
   */
  async countUsers() {
    return await User.countDocuments();
  }

  /**
   * Lägg till låt i användarens liked songs
   * @param {string} userId - User ObjectId
   * @param {string} songId - Song ObjectId
   * @returns {Promise<Object>} Uppdaterat användardokument
   */
  async likeSong(userId, songId) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { likedSongs: songId } },
      { new: true }
    ).populate('likedSongs');
  }

  /**
   * Ta bort låt från användarens liked songs
   * @param {string} userId - User ObjectId
   * @param {string} songId - Song ObjectId
   * @returns {Promise<Object>} Uppdaterat användardokument
   */
  async unlikeSong(userId, songId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { likedSongs: songId } },
      { new: true }
    ).populate('likedSongs');
  }

  /**
   * Lägg till album i användarens saved albums
   * @param {string} userId - User ObjectId
   * @param {string} albumId - Album ObjectId
   * @returns {Promise<Object>} Uppdaterat användardokument
   */
  async saveAlbum(userId, albumId) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedAlbums: albumId } },
      { new: true }
    ).populate('savedAlbums');
  }

  /**
   * Ta bort album från användarens saved albums
   * @param {string} userId - User ObjectId
   * @param {string} albumId - Album ObjectId
   * @returns {Promise<Object>} Uppdaterat användardokument
   */
  async unsaveAlbum(userId, albumId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { savedAlbums: albumId } },
      { new: true }
    ).populate('savedAlbums');
  }

  /**
   * Följ en artist
   * @param {string} userId - User ObjectId
   * @param {string} artistId - Artist ObjectId
   * @returns {Promise<Object>} Uppdaterat användardokument
   */
  async followArtist(userId, artistId) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { followedArtists: artistId } },
      { new: true }
    ).populate('followedArtists');
  }

  /**
   * Sluta följa en artist
   * @param {string} userId - User ObjectId
   * @param {string} artistId - Artist ObjectId
   * @returns {Promise<Object>} Uppdaterat användardokument
   */
  async unfollowArtist(userId, artistId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { followedArtists: artistId } },
      { new: true }
    ).populate('followedArtists');
  }

  /**
   * Hämta användarens library (liked songs, saved albums, followed artists)
   * @param {string} userId - User ObjectId
   * @returns {Promise<Object>} Användardokument med populerade library-fält
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
   * Följ en spellista
   * @param {string} userId - User ObjectId
   * @param {string} playlistId - Playlist ObjectId
   * @returns {Promise<Object>} Uppdaterat användardokument
   */
  async addFollowedPlaylist(userId, playlistId) {
    return await User.findByIdAndUpdate(
      userId,
      {$addToSet: {followedPlaylists: playlistId}},
      {new: true}
    ).populate('followedPlaylists')
  }
      /**
   * Sluta följa en spellista
   * @param {string} userId - User ObjectId
   * @param {string} playlistId - Playlist ObjectId
   * @returns {Promise<Object>} Uppdaterat användardokument
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