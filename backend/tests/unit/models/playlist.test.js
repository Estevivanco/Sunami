import { describe, it, expect, beforeEach } from 'vitest';
import Playlist from '../../../models/Playlist.js';
import Song from '../../../models/Song.js';
import Artist from '../../../models/Artist.js';
import Album from '../../../models/Album.js';
import User from '../../../models/User.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('Playlist Model', () => {
  let artist, album, song1, song2, user;

  beforeEach(async () => {
    await clearDb();
    artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
    album = await Album.create({ title: 'Test Album', artist: artist._id });
    song1 = await Song.create({ title: 'Song 1', artist: artist._id, album: album._id, duration: 180 });
    song2 = await Song.create({ title: 'Song 2', artist: artist._id, album: album._id, duration: 200 });
    user = await User.create({ username: 'testuser', email: 'test@example.com', password: 'password123' });
  });

  describe('Validation', () => {
    it('should create a valid playlist', async () => {
      const playlistData = {
        name: 'Test Playlist',
        description: 'A test playlist',
        songs: [song1._id, song2._id],
        createdBy: 'TestUser'
      };

      const playlist = await Playlist.create(playlistData);
      
      expect(playlist.name).toBe('Test Playlist');
      expect(playlist.description).toBe('A test playlist');
      expect(playlist.songs).toHaveLength(2);
      expect(playlist.createdBy).toBe('TestUser');
    });

    it('should require name', async () => {
      const playlistData = {
        description: 'A test playlist'
      };

      await expect(Playlist.create(playlistData)).rejects.toThrow();
    });

    it('should trim name', async () => {
      const playlistData = {
        name: '  Test Playlist  ',
        songs: [song1._id]
      };

      const playlist = await Playlist.create(playlistData);
      expect(playlist.name).toBe('Test Playlist');
    });

    it('should trim description', async () => {
      const playlistData = {
        name: 'Test Playlist',
        description: '  Test description  '
      };

      const playlist = await Playlist.create(playlistData);
      expect(playlist.description).toBe('Test description');
    });

    it('should filter out invalid song references', async () => {
      const fakeSongId = '507f1f77bcf86cd799439011';
      
      const playlistData = {
        name: 'Test Playlist',
        songs: [song1._id, fakeSongId, song2._id]
      };

      const playlist = await Playlist.create(playlistData);
      expect(playlist.songs).toHaveLength(2);
      expect(playlist.songs.map(s => s.toString())).toEqual([
        song1._id.toString(),
        song2._id.toString()
      ]);
    });
  });

  describe('Default values', () => {
    it('should default songs to empty array', async () => {
      const playlist = await Playlist.create({
        name: 'Empty Playlist'
      });

      expect(playlist.songs).toEqual([]);
    });

    it('should default isPublic to true', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist'
      });

      expect(playlist.isPublic).toBe(true);
    });

    it('should default owner to null', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist'
      });

      expect(playlist.owner).toBeNull();
    });

    it('should accept isPublic false', async () => {
      const playlist = await Playlist.create({
        name: 'Private Playlist',
        isPublic: false
      });

      expect(playlist.isPublic).toBe(false);
    });

    it('should accept owner', async () => {
      const playlist = await Playlist.create({
        name: 'User Playlist',
        owner: user._id
      });

      expect(playlist.owner.toString()).toBe(user._id.toString());
    });
  });

  describe('Timestamps', () => {
    it('should add createdAt timestamp', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist'
      });

      expect(playlist.createdAt).toBeInstanceOf(Date);
    });

    it('should add updatedAt timestamp', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist'
      });

      expect(playlist.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Optional fields', () => {
    it('should accept description', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        description: 'A collection of great songs'
      });

      expect(playlist.description).toBe('A collection of great songs');
    });

    it('should accept createdBy', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        createdBy: 'Admin'
      });

      expect(playlist.createdBy).toBe('Admin');
    });

    it('should work without description', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist'
      });

      expect(playlist.description).toBeUndefined();
    });

    it('should work without createdBy', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist'
      });

      expect(playlist.createdBy).toBeUndefined();
    });
  });

  describe('Song references', () => {
    it('should accept multiple songs', async () => {
      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [song1._id, song2._id]
      });

      expect(playlist.songs).toHaveLength(2);
      expect(playlist.songs[0].toString()).toBe(song1._id.toString());
      expect(playlist.songs[1].toString()).toBe(song2._id.toString());
    });

    it('should handle empty songs array', async () => {
      const playlist = await Playlist.create({
        name: 'Empty Playlist',
        songs: []
      });

      expect(playlist.songs).toEqual([]);
    });

    it('should validate song references exist', async () => {
      const validSong = song1._id;
      const invalidSong = '507f1f77bcf86cd799439011';

      const playlist = await Playlist.create({
        name: 'Test Playlist',
        songs: [validSong, invalidSong]
      });

      // Should only keep valid song
      expect(playlist.songs).toHaveLength(1);
      expect(playlist.songs[0].toString()).toBe(validSong.toString());
    });
  });

  describe('Playlist name edge cases', () => {
    it('should handle special characters in name', async () => {
      const playlist = await Playlist.create({
        name: 'My Awesome Playlist! 🎵'
      });

      expect(playlist.name).toBe('My Awesome Playlist! 🎵');
    });

    it('should handle long names', async () => {
      const longName = 'A'.repeat(200);
      const playlist = await Playlist.create({
        name: longName
      });

      expect(playlist.name).toBe(longName);
    });
  });
});
