import { describe, it, expect, beforeEach } from 'vitest';
import Album from '../../../models/Album.js';
import Artist from '../../../models/Artist.js';
import Song from '../../../models/Song.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('Album Model', () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe('Validation', () => {
    it('should create a valid album', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const albumData = {
        title: 'Test Album',
        artist: artist._id,
        releaseDate: new Date('2020-01-01')
      };

      const album = await Album.create(albumData);
      
      expect(album.title).toBe('Test Album');
      expect(album.artist.toString()).toBe(artist._id.toString());
      expect(album.releaseDate).toBeInstanceOf(Date);
    });

    it('should require title', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const albumData = {
        artist: artist._id
      };

      await expect(Album.create(albumData)).rejects.toThrow();
    });

    it('should require artist', async () => {
      const albumData = {
        title: 'Test Album'
      };

      await expect(Album.create(albumData)).rejects.toThrow();
    });

    it('should trim title', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const albumData = {
        title: '  Test Album  ',
        artist: artist._id
      };

      const album = await Album.create(albumData);
      expect(album.title).toBe('Test Album');
    });

    it('should reject if artist does not exist', async () => {
      const fakeArtistId = '507f1f77bcf86cd799439011';
      
      const albumData = {
        title: 'Test Album',
        artist: fakeArtistId
      };

      await expect(Album.create(albumData)).rejects.toThrow('Artist not found');
    });

    it('should prevent changing artist on existing album', async () => {
      const artist1 = await Artist.create({ name: 'Artist 1', country: 'USA' });
      const artist2 = await Artist.create({ name: 'Artist 2', country: 'UK' });
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist1._id
      });

      album.artist = artist2._id;
      await expect(album.save()).rejects.toThrow('Cannot change artist of an existing album');
    });

    it('should validate that songs exist', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      const fakeSongId = '507f1f77bcf86cd799439011';
      
      const albumData = {
        title: 'Test Album',
        artist: artist._id,
        songs: [fakeSongId]
      };

      await expect(Album.create(albumData)).rejects.toThrow('One or more songs not found');
    });

    it('should accept valid songs', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        album: album._id,
        duration: 180
      });

      album.songs = [song._id];
      await album.save();

      expect(album.songs).toHaveLength(1);
      expect(album.songs[0].toString()).toBe(song._id.toString());
    });
  });

  describe('Default values', () => {
    it('should default genres to empty array', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      expect(album.genres).toEqual([]);
    });

    it('should default songs to empty array', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      expect(album.songs).toEqual([]);
    });

    it('should accept genres array', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id,
        genres: ['Rock', 'Alternative']
      });

      expect(album.genres).toEqual(['Rock', 'Alternative']);
    });
  });

  describe('Timestamps', () => {
    it('should add createdAt timestamp', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      expect(album.createdAt).toBeInstanceOf(Date);
    });

    it('should add updatedAt timestamp', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      expect(album.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Total tracks calculation', () => {
    it('should update totalTracks when songs are added', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      const song1 = await Song.create({
        title: 'Song 1',
        artist: artist._id,
        album: album._id,
        duration: 180
      });

      const song2 = await Song.create({
        title: 'Song 2',
        artist: artist._id,
        album: album._id,
        duration: 200
      });

      album.songs = [song1._id, song2._id];
      await album.save();

      expect(album.totalTracks).toBe(2);
    });

    it('should handle empty songs array', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      expect(album.totalTracks).toBeUndefined();
    });
  });

  describe('Optional fields', () => {
    it('should accept releaseDate', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      const releaseDate = new Date('2020-05-15');
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id,
        releaseDate
      });

      expect(album.releaseDate).toEqual(releaseDate);
    });

    it('should accept coverImage', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id,
        coverImage: 'https://example.com/cover.jpg'
      });

      expect(album.coverImage).toBe('https://example.com/cover.jpg');
    });

    it('should trim coverImage', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id,
        coverImage: '  https://example.com/cover.jpg  '
      });

      expect(album.coverImage).toBe('https://example.com/cover.jpg');
    });

    it('should accept totalTracks', async () => {
      const artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
      
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id,
        totalTracks: 12
      });

      expect(album.totalTracks).toBe(12);
    });
  });
});
