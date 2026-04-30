import { describe, it, expect, beforeEach } from 'vitest';
import playlistRepository from '../../../repositories/playlistRepository.js';
import Playlist from '../../../models/Playlist.js';
import Song from '../../../models/Song.js';
import Artist from '../../../models/Artist.js';
import Album from '../../../models/Album.js';
import User from '../../../models/User.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('Playlist Repository', () => {
  let artist, album, song1, song2, user;

  beforeEach(async () => {
    await clearDb();
    artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
    album = await Album.create({ title: 'Test Album', artist: artist._id });
    song1 = await Song.create({ title: 'Song 1', artist: artist._id, album: album._id, duration: 180 });
    song2 = await Song.create({ title: 'Song 2', artist: artist._id, album: album._id, duration: 200 });
    user = await User.create({ username: 'testuser', email: 'test@example.com', password: 'password123' });
  });

  describe('findAll', () => {
    it('should return all playlists', async () => {
      await Playlist.create([
        { name: 'Playlist 1', songs: [song1._id] },
        { name: 'Playlist 2', songs: [song2._id] }
      ]);

      const playlists = await playlistRepository.findAll();
      expect(playlists).toHaveLength(2);
    });

    it('should return empty array when no playlists exist', async () => {
      const playlists = await playlistRepository.findAll();
      expect(playlists).toEqual([]);
    });

    it('should populate songs by default', async () => {
      await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      const playlists = await playlistRepository.findAll();
      expect(playlists[0].songs[0].title).toBe('Song 1');
    });

    it('should not populate when populate is false', async () => {
      await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      const playlists = await playlistRepository.findAll(false);
      expect(playlists[0].songs[0].title).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find playlist by ID', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id, song2._id]
      });

      const found = await playlistRepository.findById(playlist._id);
      expect(found.name).toBe('Test Playlist');
      expect(found.songs).toHaveLength(2);
    });

    it('should return null for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const playlist = await playlistRepository.findById(fakeId);
      expect(playlist).toBeNull();
    });

    it('should populate songs with artist and album', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      const found = await playlistRepository.findById(playlist._id, true);
      expect(found.songs[0].title).toBe('Song 1');
      expect(found.songs[0].artist.name).toBe('Test Artist');
      expect(found.songs[0].album.title).toBe('Test Album');
    });

    it('should not populate when populate is false', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      const found = await playlistRepository.findById(playlist._id, false);
      expect(found.songs[0].title).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new playlist', async () => {
      const playlistData = {
        name: 'New Playlist',
        description: 'Test description',
        songs: [song1._id, song2._id],
        createdBy: 'TestUser'
      };

      const playlist = await playlistRepository.create(playlistData);
      expect(playlist.name).toBe('New Playlist');
      expect(playlist.description).toBe('Test description');
      expect(playlist.songs).toHaveLength(2);
      expect(playlist._id).toBeDefined();
    });

    it('should create playlist with owner', async () => {
      const playlistData = {
        name: 'User Playlist',
        owner: user._id,
        isPublic: false
      };

      const playlist = await playlistRepository.create(playlistData);
      expect(playlist.owner.toString()).toBe(user._id.toString());
      expect(playlist.isPublic).toBe(false);
    });

    it('should reject invalid playlist data', async () => {
      const playlistData = {
        // missing name
        songs: [song1._id]
      };

      await expect(playlistRepository.create(playlistData)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update playlist name', async () => {
      const playlist = await Playlist.create({
        name: 'Old Name',
        songs: [song1._id]
      });

      const updated = await playlistRepository.update(playlist._id, { name: 'New Name' });
      expect(updated.name).toBe('New Name');
    });

    it('should update playlist description', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist'
      });

      const updated = await playlistRepository.update(playlist._id, {
        description: 'New description'
      });
      expect(updated.description).toBe('New description');
    });

    it('should update isPublic status', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        isPublic: true
      });

      const updated = await playlistRepository.update(playlist._id, { isPublic: false });
      expect(updated.isPublic).toBe(false);
    });

    it('should return null for non-existent playlist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updated = await playlistRepository.update(fakeId, { name: 'New Name' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a playlist', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      const deleted = await playlistRepository.delete(playlist._id);
      expect(deleted._id.toString()).toBe(playlist._id.toString());

      const found = await Playlist.findById(playlist._id);
      expect(found).toBeNull();
    });

    it('should return null for non-existent playlist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const deleted = await playlistRepository.delete(fakeId);
      expect(deleted).toBeNull();
    });
  });

  describe('findByCreator', () => {
    it('should find playlists by creator', async () => {
      await Playlist.create([
        { name: 'Playlist 1', createdBy: 'TestUser', songs: [song1._id] },
        { name: 'Playlist 2', createdBy: 'TestUser', songs: [song2._id] },
        { name: 'Playlist 3', createdBy: 'OtherUser', songs: [song1._id] }
      ]);

      const playlists = await playlistRepository.findByCreator('TestUser');
      expect(playlists).toHaveLength(2);
      expect(playlists[0].createdBy).toBe('TestUser');
    });

    it('should return empty array when creator has no playlists', async () => {
      const playlists = await playlistRepository.findByCreator('NonExistentUser');
      expect(playlists).toEqual([]);
    });

    it('should populate songs', async () => {
      await Playlist.create({
        name: 'Test Playlist',
        createdBy: 'TestUser',
        songs: [song1._id]
      });

      const playlists = await playlistRepository.findByCreator('TestUser');
      expect(playlists[0].songs[0].title).toBe('Song 1');
    });
  });

  describe('findPublic', () => {
    it('should find all public playlists', async () => {
      await Playlist.create([
        { name: 'Public 1', isPublic: true, songs: [song1._id] },
        { name: 'Private 1', isPublic: false, songs: [song2._id] },
        { name: 'Public 2', isPublic: true, songs: [song1._id] }
      ]);

      const playlists = await playlistRepository.findPublic();
      expect(playlists).toHaveLength(2);
      expect(playlists.every(p => p.isPublic)).toBe(true);
    });

    it('should return empty array when no public playlists exist', async () => {
      await Playlist.create({
        name: 'Private Playlist',
        isPublic: false
      });

      const playlists = await playlistRepository.findPublic();
      expect(playlists).toEqual([]);
    });

    it('should populate songs', async () => {
      await Playlist.create({
        name: 'Public Playlist',
        isPublic: true,
        songs: [song1._id]
      });

      const playlists = await playlistRepository.findPublic();
      expect(playlists[0].songs[0].title).toBe('Song 1');
    });
  });

  describe('findByOwner', () => {
    it('should find playlists by owner', async () => {
      await Playlist.create([
        { name: 'Playlist 1', owner: user._id, songs: [song1._id] },
        { name: 'Playlist 2', owner: user._id, songs: [song2._id] }
      ]);

      const playlists = await playlistRepository.findByOwner(user._id);
      expect(playlists).toHaveLength(2);
      expect(playlists[0].owner.toString()).toBe(user._id.toString());
    });

    it('should sort by createdAt descending', async () => {
      const playlist1 = await Playlist.create({
        name: 'First',
        owner: user._id
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const playlist2 = await Playlist.create({
        name: 'Second',
        owner: user._id
      });

      const playlists = await playlistRepository.findByOwner(user._id);
      expect(playlists[0].name).toBe('Second');
      expect(playlists[1].name).toBe('First');
    });

    it('should return empty array when owner has no playlists', async () => {
      const user2 = await User.create({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123'
      });

      const playlists = await playlistRepository.findByOwner(user2._id);
      expect(playlists).toEqual([]);
    });
  });

  describe('addSongToPlaylist', () => {
    it('should add song to playlist', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      const updated = await playlistRepository.addSongToPlaylist(playlist._id, song2._id);
      expect(updated.songs).toHaveLength(2);
      expect(updated.songs.map(s => s._id.toString())).toContain(song2._id.toString());
    });

    it('should prevent duplicate songs', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      const updated = await playlistRepository.addSongToPlaylist(playlist._id, song1._id);
      expect(updated.songs).toHaveLength(1);
    });

    it('should return null for non-existent playlist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updated = await playlistRepository.addSongToPlaylist(fakeId, song1._id);
      expect(updated).toBeNull();
    });

    it('should populate songs', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: []
      });

      const updated = await playlistRepository.addSongToPlaylist(playlist._id, song1._id);
      expect(updated.songs[0].title).toBe('Song 1');
    });
  });

  describe('removeSongFromPlaylist', () => {
    it('should remove song from playlist', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id, song2._id]
      });

      const updated = await playlistRepository.removeSongFromPlaylist(playlist._id, song1._id);
      expect(updated.songs).toHaveLength(1);
      expect(updated.songs[0]._id.toString()).toBe(song2._id.toString());
    });

    it('should handle removing non-existent song', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      const updated = await playlistRepository.removeSongFromPlaylist(playlist._id, song2._id);
      expect(updated.songs).toHaveLength(1);
      expect(updated.songs[0]._id.toString()).toBe(song1._id.toString());
    });

    it('should return null for non-existent playlist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updated = await playlistRepository.removeSongFromPlaylist(fakeId, song1._id);
      expect(updated).toBeNull();
    });

    it('should populate remaining songs', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id, song2._id]
      });

      const updated = await playlistRepository.removeSongFromPlaylist(playlist._id, song1._id);
      expect(updated.songs[0].title).toBe('Song 2');
    });
  });
});
