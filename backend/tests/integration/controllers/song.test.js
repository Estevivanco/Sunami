import { describe, it, expect, beforeEach } from 'vitest';
import Song from '../../../models/Song.js';
import Artist from '../../../models/Artist.js';
import Album from '../../../models/Album.js';
import songRepository from '../../../repositories/songRepository.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('Song Integration Tests', () => {
  let artist, album;

  beforeEach(async () => {
    await clearDb();
    artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
    album = await Album.create({ title: 'Test Album', artist: artist._id });
  });

  describe('Song CRUD operations', () => {
    it('should create and retrieve a song', async () => {
      const songData = {
        title: 'Test Song',
        artist: artist._id,
        album: album._id,
        duration: 240,
        genres: ['Rock', 'Alternative'],
        popularity: 85
      };

      const created = await songRepository.create(songData);
      const retrieved = await songRepository.findById(created._id);

      expect(retrieved.title).toBe('Test Song');
      expect(retrieved.artist.name).toBe('Test Artist');
      expect(retrieved.album.title).toBe('Test Album');
      expect(retrieved.duration).toBe(240);
      expect(retrieved.genres).toEqual(['Rock', 'Alternative']);
      expect(retrieved.popularity).toBe(85);
    });

    it('should create song without album', async () => {
      const songData = {
        title: 'Single Track',
        artist: artist._id,
        duration: 180
      };

      const created = await songRepository.create(songData);
      const retrieved = await songRepository.findById(created._id);

      expect(retrieved.title).toBe('Single Track');
      expect(retrieved.artist.name).toBe('Test Artist');
      expect(retrieved.album).toBeUndefined();
    });

    it('should update song information', async () => {
      const song = await songRepository.create({
        title: 'Old Title',
        artist: artist._id,
        duration: 180
      });

      const updated = await songRepository.update(song._id, {
        title: 'New Title',
        popularity: 95,
        playCount: 1000
      });

      expect(updated.title).toBe('New Title');
      expect(updated.popularity).toBe(95);
      expect(updated.playCount).toBe(1000);
    });

    it('should delete a song', async () => {
      const song = await songRepository.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180
      });

      await songRepository.delete(song._id);
      const deleted = await songRepository.findById(song._id);
      expect(deleted).toBeNull();
    });
  });

  describe('Song-Artist relationship', () => {
    it('should find all songs by artist', async () => {
      await songRepository.create({
        title: 'Song 1',
        artist: artist._id,
        duration: 180,
        playCount: 100
      });

      await songRepository.create({
        title: 'Song 2',
        artist: artist._id,
        duration: 200,
        playCount: 500
      });

      const songs = await songRepository.findByArtistId(artist._id);
      expect(songs).toHaveLength(2);
      expect(songs[0].artist.name).toBe('Test Artist');
    });

    it('should sort songs by popularity', async () => {
      await songRepository.create({
        title: 'Less Popular',
        artist: artist._id,
        duration: 180,
        playCount: 100
      });

      await songRepository.create({
        title: 'Most Popular',
        artist: artist._id,
        duration: 200,
        playCount: 1000
      });

      const songs = await songRepository.findByArtistId(artist._id);
      expect(songs[0].title).toBe('Most Popular');
      expect(songs[1].title).toBe('Less Popular');
    });
  });

  describe('Song-Album relationship', () => {
    it('should ensure album belongs to artist', async () => {
      const artist2 = await Artist.create({ name: 'Another Artist', country: 'UK' });
      const album2 = await Album.create({ title: 'Another Album', artist: artist2._id });

      await expect(
        songRepository.create({
          title: 'Test Song',
          artist: artist._id,
          album: album2._id,
          duration: 180
        })
      ).rejects.toThrow('Album does not belong to this artist');
    });

    it('should reject non-existent album', async () => {
      const fakeAlbumId = '507f1f77bcf86cd799439011';

      await expect(
        songRepository.create({
          title: 'Test Song',
          artist: artist._id,
          album: fakeAlbumId,
          duration: 180
        })
      ).rejects.toThrow('Album does not exist');
    });

    it('should create multiple songs for same album', async () => {
      await songRepository.create({
        title: 'Song 1',
        artist: artist._id,
        album: album._id,
        duration: 180
      });

      await songRepository.create({
        title: 'Song 2',
        artist: artist._id,
        album: album._id,
        duration: 200
      });

      const allSongs = await songRepository.findAll();
      const albumSongs = allSongs.filter(s => s.album && s.album._id.toString() === album._id.toString());
      expect(albumSongs).toHaveLength(2);
    });
  });

  describe('Song search', () => {
    it('should search songs by title', async () => {
      await songRepository.create({
        title: 'Dancing Queen',
        artist: artist._id,
        duration: 180
      });

      await songRepository.create({
        title: 'Dancing in the Dark',
        artist: artist._id,
        duration: 200
      });

      await songRepository.create({
        title: 'Walking on Sunshine',
        artist: artist._id,
        duration: 190
      });

      const songs = await songRepository.search('Dancing');
      expect(songs).toHaveLength(2);
    });

    it('should search songs by genre', async () => {
      await songRepository.create({
        title: 'Rock Song 1',
        artist: artist._id,
        duration: 180,
        genres: ['Rock']
      });

      await songRepository.create({
        title: 'Jazz Song',
        artist: artist._id,
        duration: 200,
        genres: ['Jazz']
      });

      await songRepository.create({
        title: 'Rock Song 2',
        artist: artist._id,
        duration: 190,
        genres: ['Rock']
      });

      const rockSongs = await songRepository.findByGenre('Rock');
      expect(rockSongs).toHaveLength(2);
    });

    it('should search artist songs with filter', async () => {
      await songRepository.create({
        title: 'Hello World',
        artist: artist._id,
        duration: 180
      });

      await songRepository.create({
        title: 'Hello Friend',
        artist: artist._id,
        duration: 200
      });

      await songRepository.create({
        title: 'Goodbye World',
        artist: artist._id,
        duration: 190
      });

      const songs = await songRepository.searchByArtist(artist._id, 'Hello');
      expect(songs).toHaveLength(2);
    });
  });

  describe('Duration validation', () => {
    it('should convert negative duration to 0', async () => {
      const song = await songRepository.create({
        title: 'Test Song',
        artist: artist._id,
        duration: -100
      });

      const retrieved = await songRepository.findById(song._id);
      expect(retrieved.duration).toBe(0);
    });

    it('should accept positive duration', async () => {
      const song = await songRepository.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 300
      });

      const retrieved = await songRepository.findById(song._id);
      expect(retrieved.duration).toBe(300);
    });
  });

  describe('Play count tracking', () => {
    it('should track play count updates', async () => {
      const song = await songRepository.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180,
        playCount: 0
      });

      await songRepository.update(song._id, { playCount: 10 });
      let updated = await songRepository.findById(song._id);
      expect(updated.playCount).toBe(10);

      await songRepository.update(song._id, { playCount: 50 });
      updated = await songRepository.findById(song._id);
      expect(updated.playCount).toBe(50);
    });
  });

  describe('Multiple artists scenario', () => {
    it('should maintain separate song collections per artist', async () => {
      const artist2 = await Artist.create({ name: 'Artist 2', country: 'UK' });
      const artist3 = await Artist.create({ name: 'Artist 3', country: 'Canada' });

      await songRepository.create({ title: 'Artist 1 Song 1', artist: artist._id, duration: 180 });
      await songRepository.create({ title: 'Artist 1 Song 2', artist: artist._id, duration: 200 });
      await songRepository.create({ title: 'Artist 2 Song 1', artist: artist2._id, duration: 190 });
      await songRepository.create({ title: 'Artist 3 Song 1', artist: artist3._id, duration: 210 });

      const artist1Songs = await songRepository.findByArtistId(artist._id);
      const artist2Songs = await songRepository.findByArtistId(artist2._id);
      const artist3Songs = await songRepository.findByArtistId(artist3._id);

      expect(artist1Songs).toHaveLength(2);
      expect(artist2Songs).toHaveLength(1);
      expect(artist3Songs).toHaveLength(1);
    });
  });

  describe('Genre filtering', () => {
    it('should handle multiple genres per song', async () => {
      await songRepository.create({
        title: 'Multi-genre Song',
        artist: artist._id,
        duration: 180,
        genres: ['Rock', 'Pop', 'Alternative']
      });

      const rockSongs = await songRepository.findByGenre('Rock');
      const popSongs = await songRepository.findByGenre('Pop');
      const altSongs = await songRepository.findByGenre('Alternative');

      expect(rockSongs).toHaveLength(1);
      expect(popSongs).toHaveLength(1);
      expect(altSongs).toHaveLength(1);
    });

    it('should search across title and genres', async () => {
      await songRepository.create({
        title: 'Rock Anthem',
        artist: artist._id,
        duration: 180,
        genres: ['Rock']
      });

      await songRepository.create({
        title: 'Pop Song',
        artist: artist._id,
        duration: 200,
        genres: ['Rock']
      });

      const songs = await songRepository.search('Rock');
      expect(songs).toHaveLength(2); // One by title, one by genre
    });
  });

  describe('Popularity management', () => {
    it('should enforce popularity range', async () => {
      await expect(
        songRepository.create({
          title: 'Test Song',
          artist: artist._id,
          duration: 180,
          popularity: 150
        })
      ).rejects.toThrow();

      await expect(
        songRepository.create({
          title: 'Test Song',
          artist: artist._id,
          duration: 180,
          popularity: -10
        })
      ).rejects.toThrow();
    });

    it('should accept valid popularity values', async () => {
      const song1 = await songRepository.create({
        title: 'Low Popularity',
        artist: artist._id,
        duration: 180,
        popularity: 0
      });

      const song2 = await songRepository.create({
        title: 'High Popularity',
        artist: artist._id,
        duration: 200,
        popularity: 100
      });

      expect(song1.popularity).toBe(0);
      expect(song2.popularity).toBe(100);
    });
  });
});
