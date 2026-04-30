import { describe, it, expect, beforeEach } from 'vitest';
import Playlist from '../../../models/Playlist.js';
import Song from '../../../models/Song.js';
import Artist from '../../../models/Artist.js';
import Album from '../../../models/Album.js';
import User from '../../../models/User.js';
import playlistRepository from '../../../repositories/playlistRepository.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('Playlist Integration Tests', () => {
  let artist, album, song1, song2, song3, user;

  beforeEach(async () => {
    await clearDb();
    artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
    album = await Album.create({ title: 'Test Album', artist: artist._id });
    song1 = await Song.create({ title: 'Song 1', artist: artist._id, album: album._id, duration: 180 });
    song2 = await Song.create({ title: 'Song 2', artist: artist._id, album: album._id, duration: 200 });
    song3 = await Song.create({ title: 'Song 3', artist: artist._id, album: album._id, duration: 220 });
    user = await User.create({ username: 'testuser', email: 'test@example.com', password: 'password123' });
  });

  describe('Playlist CRUD operations', () => {
    it('should create and retrieve a playlist', async () => {
      const playlistData = {
        name: 'My Playlist',
        description: 'Favorite songs',
        songs: [song1._id, song2._id],
        createdBy: 'TestUser',
        isPublic: true
      };

      const created = await playlistRepository.create(playlistData);
      const retrieved = await playlistRepository.findById(created._id);

      expect(retrieved.name).toBe('My Playlist');
      expect(retrieved.description).toBe('Favorite songs');
      expect(retrieved.songs).toHaveLength(2);
      expect(retrieved.createdBy).toBe('TestUser');
      expect(retrieved.isPublic).toBe(true);
    });

    it('should create empty playlist', async () => {
      const playlistData = {
        name: 'Empty Playlist'
      };

      const created = await playlistRepository.create(playlistData);
      const retrieved = await playlistRepository.findById(created._id);

      expect(retrieved.name).toBe('Empty Playlist');
      expect(retrieved.songs).toEqual([]);
    });

    it('should update playlist information', async () => {
      const playlist = await playlistRepository.create({
        name: 'Old Name',
        description: 'Old description'
      });

      const updated = await playlistRepository.update(playlist._id, {
        name: 'New Name',
        description: 'New description',
        isPublic: false
      });

      expect(updated.name).toBe('New Name');
      expect(updated.description).toBe('New description');
      expect(updated.isPublic).toBe(false);
    });

    it('should delete a playlist', async () => {
      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      await playlistRepository.delete(playlist._id);
      const deleted = await playlistRepository.findById(playlist._id);
      expect(deleted).toBeNull();
    });
  });

  describe('Playlist song management', () => {
    it('should add songs to playlist', async () => {
      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      await playlistRepository.addSongToPlaylist(playlist._id, song2._id);
      await playlistRepository.addSongToPlaylist(playlist._id, song3._id);

      const updated = await playlistRepository.findById(playlist._id);
      expect(updated.songs).toHaveLength(3);
    });

    it('should remove songs from playlist', async () => {
      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        songs: [song1._id, song2._id, song3._id]
      });

      await playlistRepository.removeSongFromPlaylist(playlist._id, song2._id);

      const updated = await playlistRepository.findById(playlist._id);
      expect(updated.songs).toHaveLength(2);
      expect(updated.songs.map(s => s._id.toString())).not.toContain(song2._id.toString());
    });

    it('should prevent duplicate songs', async () => {
      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      await playlistRepository.addSongToPlaylist(playlist._id, song1._id);

      const updated = await playlistRepository.findById(playlist._id);
      expect(updated.songs).toHaveLength(1);
    });

    it('should populate song details', async () => {
      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        songs: [song1._id, song2._id]
      });

      const retrieved = await playlistRepository.findById(playlist._id, true);
      expect(retrieved.songs[0].title).toBe('Song 1');
      expect(retrieved.songs[0].artist.name).toBe('Test Artist');
      expect(retrieved.songs[0].album.title).toBe('Test Album');
    });
  });

  describe('Public vs Private playlists', () => {
    it('should filter public playlists', async () => {
      await playlistRepository.create({
        name: 'Public 1',
        isPublic: true,
        songs: [song1._id]
      });

      await playlistRepository.create({
        name: 'Private 1',
        isPublic: false,
        songs: [song2._id]
      });

      await playlistRepository.create({
        name: 'Public 2',
        isPublic: true,
        songs: [song3._id]
      });

      const publicPlaylists = await playlistRepository.findPublic();
      expect(publicPlaylists).toHaveLength(2);
      expect(publicPlaylists.every(p => p.isPublic)).toBe(true);
    });

    it('should toggle playlist visibility', async () => {
      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        isPublic: true
      });

      const updated = await playlistRepository.update(playlist._id, { isPublic: false });
      expect(updated.isPublic).toBe(false);

      const publicPlaylists = await playlistRepository.findPublic();
      expect(publicPlaylists).toHaveLength(0);
    });
  });

  describe('User playlists', () => {
    it('should find playlists by owner', async () => {
      const user2 = await User.create({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123'
      });

      await playlistRepository.create({
        name: 'User 1 Playlist 1',
        owner: user._id,
        songs: [song1._id]
      });

      await playlistRepository.create({
        name: 'User 1 Playlist 2',
        owner: user._id,
        songs: [song2._id]
      });

      await playlistRepository.create({
        name: 'User 2 Playlist',
        owner: user2._id,
        songs: [song3._id]
      });

      const user1Playlists = await playlistRepository.findByOwner(user._id);
      expect(user1Playlists).toHaveLength(2);
      expect(user1Playlists.every(p => p.owner.toString() === user._id.toString())).toBe(true);
    });

    it('should sort user playlists by creation date', async () => {
      const playlist1 = await playlistRepository.create({
        name: 'First',
        owner: user._id
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const playlist2 = await playlistRepository.create({
        name: 'Second',
        owner: user._id
      });

      const playlists = await playlistRepository.findByOwner(user._id);
      expect(playlists[0].name).toBe('Second');
      expect(playlists[1].name).toBe('First');
    });
  });

  describe('Playlist by creator', () => {
    it('should find playlists by creator name', async () => {
      await playlistRepository.create({
        name: 'Playlist 1',
        createdBy: 'Admin',
        songs: [song1._id]
      });

      await playlistRepository.create({
        name: 'Playlist 2',
        createdBy: 'Admin',
        songs: [song2._id]
      });

      await playlistRepository.create({
        name: 'Playlist 3',
        createdBy: 'User',
        songs: [song3._id]
      });

      const adminPlaylists = await playlistRepository.findByCreator('Admin');
      expect(adminPlaylists).toHaveLength(2);
      expect(adminPlaylists.every(p => p.createdBy === 'Admin')).toBe(true);
    });
  });

  describe('Invalid song references', () => {
    it('should filter out invalid songs on creation', async () => {
      const fakeSongId = '507f1f77bcf86cd799439011';

      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        songs: [song1._id, fakeSongId, song2._id]
      });

      expect(playlist.songs).toHaveLength(2);
      expect(playlist.songs.map(s => s.toString())).toEqual([
        song1._id.toString(),
        song2._id.toString()
      ]);
    });

    it('should handle all invalid songs', async () => {
      const fakeSongId1 = '507f1f77bcf86cd799439011';
      const fakeSongId2 = '507f1f77bcf86cd799439012';

      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        songs: [fakeSongId1, fakeSongId2]
      });

      expect(playlist.songs).toEqual([]);
    });
  });

  describe('Default name handling', () => {
    it('should preserve valid name', async () => {
      const playlist = await playlistRepository.create({
        name: 'My Playlist'
      });

      expect(playlist.name).toBe('My Playlist');
    });
  });

  describe('Multiple playlists with same songs', () => {
    it('should allow same song in multiple playlists', async () => {
      const playlist1 = await playlistRepository.create({
        name: 'Playlist 1',
        songs: [song1._id, song2._id]
      });

      const playlist2 = await playlistRepository.create({
        name: 'Playlist 2',
        songs: [song1._id, song3._id]
      });

      const retrieved1 = await playlistRepository.findById(playlist1._id);
      const retrieved2 = await playlistRepository.findById(playlist2._id);

      expect(retrieved1.songs).toHaveLength(2);
      expect(retrieved2.songs).toHaveLength(2);

      const song1InBoth = 
        retrieved1.songs.some(s => s._id.toString() === song1._id.toString()) &&
        retrieved2.songs.some(s => s._id.toString() === song1._id.toString());

      expect(song1InBoth).toBe(true);
    });
  });

  describe('Playlist population options', () => {
    it('should support populate=true', async () => {
      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      const found = await playlistRepository.findById(playlist._id, true);
      expect(found.songs[0].title).toBe('Song 1');
      expect(found.songs[0].artist.name).toBe('Test Artist');
    });

    it('should support populate=false', async () => {
      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      const found = await playlistRepository.findById(playlist._id, false);
      expect(found.songs[0].title).toBeUndefined();
    });
  });

  describe('Empty playlist operations', () => {
    it('should handle adding to empty playlist', async () => {
      const playlist = await playlistRepository.create({
        name: 'Empty Playlist',
        songs: []
      });

      await playlistRepository.addSongToPlaylist(playlist._id, song1._id);

      const updated = await playlistRepository.findById(playlist._id);
      expect(updated.songs).toHaveLength(1);
    });

    it('should handle removing all songs', async () => {
      const playlist = await playlistRepository.create({
        name: 'Test Playlist',
        songs: [song1._id]
      });

      await playlistRepository.removeSongFromPlaylist(playlist._id, song1._id);

      const updated = await playlistRepository.findById(playlist._id);
      expect(updated.songs).toEqual([]);
    });
  });
});
