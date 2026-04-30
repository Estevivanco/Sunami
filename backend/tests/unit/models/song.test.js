import { describe, it, expect, beforeEach } from 'vitest';
import Song from '../../../models/Song.js';
import Artist from '../../../models/Artist.js';
import Album from '../../../models/Album.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('Song Model', () => {
  let artist, album;

  beforeEach(async () => {
    await clearDb();
    artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
    album = await Album.create({ title: 'Test Album', artist: artist._id });
  });

  describe('Validation', () => {
    it('should create a valid song', async () => {
      const songData = {
        title: 'Test Song',
        artist: artist._id,
        album: album._id,
        duration: 180
      };

      const song = await Song.create(songData);
      
      expect(song.title).toBe('Test Song');
      expect(song.artist.toString()).toBe(artist._id.toString());
      expect(song.album.toString()).toBe(album._id.toString());
      expect(song.duration).toBe(180);
    });

    it('should require title', async () => {
      const songData = {
        artist: artist._id,
        duration: 180
      };

      await expect(Song.create(songData)).rejects.toThrow();
    });

    it('should require artist', async () => {
      const songData = {
        title: 'Test Song',
        duration: 180
      };

      await expect(Song.create(songData)).rejects.toThrow();
    });

    it('should trim title', async () => {
      const songData = {
        title: '  Test Song  ',
        artist: artist._id,
        duration: 180
      };

      const song = await Song.create(songData);
      expect(song.title).toBe('Test Song');
    });

    it('should allow song without album', async () => {
      const songData = {
        title: 'Test Song',
        artist: artist._id,
        duration: 180
      };

      const song = await Song.create(songData);
      expect(song.album).toBeUndefined();
    });

    it('should reject if album does not exist', async () => {
      const fakeAlbumId = '507f1f77bcf86cd799439011';
      
      const songData = {
        title: 'Test Song',
        artist: artist._id,
        album: fakeAlbumId,
        duration: 180
      };

      await expect(Song.create(songData)).rejects.toThrow('Album does not exist');
    });

    it('should reject if album does not belong to artist', async () => {
      const artist2 = await Artist.create({ name: 'Another Artist', country: 'UK' });
      const album2 = await Album.create({ title: 'Another Album', artist: artist2._id });

      const songData = {
        title: 'Test Song',
        artist: artist._id,
        album: album2._id,
        duration: 180
      };

      await expect(Song.create(songData)).rejects.toThrow('Album does not belong to this artist');
    });
  });

  describe('Default values', () => {
    it('should default genres to empty array', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180
      });

      expect(song.genres).toEqual([]);
    });

    it('should default playCount to 0', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180
      });

      expect(song.playCount).toBe(0);
    });

    it('should default popularity to 0', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180
      });

      expect(song.popularity).toBe(0);
    });

    it('should accept genres array', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180,
        genres: ['Rock', 'Alternative']
      });

      expect(song.genres).toEqual(['Rock', 'Alternative']);
    });
  });

  describe('Duration validation', () => {
    it('should set negative duration to 0', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: -100
      });

      expect(song.duration).toBe(0);
    });

    it('should accept positive duration', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 250
      });

      expect(song.duration).toBe(250);
    });

    it('should accept zero duration', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 0
      });

      expect(song.duration).toBe(0);
    });
  });

  describe('Popularity validation', () => {
    it('should enforce minimum popularity of 0', async () => {
      const songData = {
        title: 'Test Song',
        artist: artist._id,
        duration: 180,
        popularity: -10
      };

      await expect(Song.create(songData)).rejects.toThrow();
    });

    it('should enforce maximum popularity of 100', async () => {
      const songData = {
        title: 'Test Song',
        artist: artist._id,
        duration: 180,
        popularity: 150
      };

      await expect(Song.create(songData)).rejects.toThrow();
    });

    it('should accept popularity within range', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180,
        popularity: 75
      });

      expect(song.popularity).toBe(75);
    });
  });

  describe('Optional fields', () => {
    it('should accept previewUrl', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180,
        previewUrl: 'https://example.com/preview.mp3'
      });

      expect(song.previewUrl).toBe('https://example.com/preview.mp3');
    });

    it('should accept spotifyUrl', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180,
        spotifyUrl: 'https://open.spotify.com/track/123'
      });

      expect(song.spotifyUrl).toBe('https://open.spotify.com/track/123');
    });

    it('should accept playCount', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180,
        playCount: 1000
      });

      expect(song.playCount).toBe(1000);
    });
  });

  describe('Timestamps', () => {
    it('should add createdAt timestamp', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180
      });

      expect(song.createdAt).toBeInstanceOf(Date);
    });

    it('should add updatedAt timestamp', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180
      });

      expect(song.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Artist-Album relationship', () => {
    it('should accept song with matching artist and album', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        album: album._id,
        duration: 180
      });

      expect(song.artist.toString()).toBe(artist._id.toString());
      expect(song.album.toString()).toBe(album._id.toString());
    });

    it('should create song without album', async () => {
      const song = await Song.create({
        title: 'Single Track',
        artist: artist._id,
        duration: 180
      });

      expect(song.album).toBeUndefined();
    });
  });
});
