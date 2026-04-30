import { describe, it, expect, beforeEach } from 'vitest';
import songRepository from '../../../repositories/songRepository.js';
import Song from '../../../models/Song.js';
import Artist from '../../../models/Artist.js';
import Album from '../../../models/Album.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('Song Repository', () => {
  let artist, album;

  beforeEach(async () => {
    await clearDb();
    artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
    album = await Album.create({ title: 'Test Album', artist: artist._id });
  });

  describe('findAll', () => {
    it('should return all songs', async () => {
      await Song.create([
        { title: 'Song 1', artist: artist._id, duration: 180 },
        { title: 'Song 2', artist: artist._id, duration: 200 }
      ]);

      const songs = await songRepository.findAll();
      expect(songs).toHaveLength(2);
    });

    it('should return empty array when no songs exist', async () => {
      const songs = await songRepository.findAll();
      expect(songs).toEqual([]);
    });

    it('should populate artist and album', async () => {
      await Song.create({
        title: 'Test Song',
        artist: artist._id,
        album: album._id,
        duration: 180
      });

      const songs = await songRepository.findAll();
      expect(songs[0].artist.name).toBe('Test Artist');
      expect(songs[0].album.title).toBe('Test Album');
    });
  });

  describe('findById', () => {
    it('should find song by ID', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        album: album._id,
        duration: 180
      });

      const found = await songRepository.findById(song._id);
      expect(found.title).toBe('Test Song');
      expect(found.artist.name).toBe('Test Artist');
      expect(found.album.title).toBe('Test Album');
    });

    it('should return null for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const song = await songRepository.findById(fakeId);
      expect(song).toBeNull();
    });

    it('should populate artist and album', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        album: album._id,
        duration: 180
      });

      const found = await songRepository.findById(song._id);
      expect(found.artist).toBeDefined();
      expect(found.album).toBeDefined();
      expect(found.artist.name).toBe('Test Artist');
    });
  });

  describe('create', () => {
    it('should create a new song', async () => {
      const songData = {
        title: 'New Song',
        artist: artist._id,
        album: album._id,
        duration: 210
      };

      const song = await songRepository.create(songData);
      expect(song.title).toBe('New Song');
      expect(song.duration).toBe(210);
      expect(song._id).toBeDefined();
    });

    it('should create song with genres and popularity', async () => {
      const songData = {
        title: 'New Song',
        artist: artist._id,
        duration: 180,
        genres: ['Rock', 'Pop'],
        popularity: 85
      };

      const song = await songRepository.create(songData);
      expect(song.genres).toEqual(['Rock', 'Pop']);
      expect(song.popularity).toBe(85);
    });

    it('should reject invalid song data', async () => {
      const songData = {
        artist: artist._id
        // missing title
      };

      await expect(songRepository.create(songData)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update song title', async () => {
      const song = await Song.create({
        title: 'Old Title',
        artist: artist._id,
        duration: 180
      });

      const updated = await songRepository.update(song._id, { title: 'New Title' });
      expect(updated.title).toBe('New Title');
    });

    it('should update song popularity', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180
      });

      const updated = await songRepository.update(song._id, { popularity: 90 });
      expect(updated.popularity).toBe(90);
    });

    it('should update playCount', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180
      });

      const updated = await songRepository.update(song._id, { playCount: 500 });
      expect(updated.playCount).toBe(500);
    });

    it('should return null for non-existent song', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updated = await songRepository.update(fakeId, { title: 'New Title' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a song', async () => {
      const song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        duration: 180
      });

      const deleted = await songRepository.delete(song._id);
      expect(deleted._id.toString()).toBe(song._id.toString());

      const found = await Song.findById(song._id);
      expect(found).toBeNull();
    });

    it('should return null for non-existent song', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const deleted = await songRepository.delete(fakeId);
      expect(deleted).toBeNull();
    });
  });

  describe('findByArtistId', () => {
    it('should find all songs by artist ID', async () => {
      const artist2 = await Artist.create({ name: 'Another Artist', country: 'UK' });

      await Song.create([
        { title: 'Song 1', artist: artist._id, duration: 180 },
        { title: 'Song 2', artist: artist._id, duration: 200 },
        { title: 'Song 3', artist: artist2._id, duration: 190 }
      ]);

      const songs = await songRepository.findByArtistId(artist._id);
      expect(songs).toHaveLength(2);
      expect(songs[0].artist.name).toBe('Test Artist');
    });

    it('should sort by playCount descending', async () => {
      await Song.create([
        { title: 'Less Popular', artist: artist._id, duration: 180, playCount: 100 },
        { title: 'Most Popular', artist: artist._id, duration: 200, playCount: 1000 },
        { title: 'Medium Popular', artist: artist._id, duration: 190, playCount: 500 }
      ]);

      const songs = await songRepository.findByArtistId(artist._id);
      expect(songs[0].title).toBe('Most Popular');
      expect(songs[1].title).toBe('Medium Popular');
      expect(songs[2].title).toBe('Less Popular');
    });

    it('should return empty array when artist has no songs', async () => {
      const artist2 = await Artist.create({ name: 'No Songs Artist', country: 'Canada' });
      
      const songs = await songRepository.findByArtistId(artist2._id);
      expect(songs).toEqual([]);
    });

    it('should populate artist and album', async () => {
      await Song.create({
        title: 'Test Song',
        artist: artist._id,
        album: album._id,
        duration: 180
      });

      const songs = await songRepository.findByArtistId(artist._id);
      expect(songs[0].artist.name).toBe('Test Artist');
      expect(songs[0].album.title).toBe('Test Album');
    });
  });

  describe('searchByArtist', () => {
    it('should search songs by artist with query', async () => {
      await Song.create([
        { title: 'Hello World', artist: artist._id, duration: 180 },
        { title: 'Goodbye World', artist: artist._id, duration: 200 },
        { title: 'Hello Friend', artist: artist._id, duration: 190 }
      ]);

      const songs = await songRepository.searchByArtist(artist._id, 'Hello');
      expect(songs).toHaveLength(2);
      expect(songs.every(s => s.title.includes('Hello'))).toBe(true);
    });

    it('should be case-insensitive', async () => {
      await Song.create({
        title: 'Hello World',
        artist: artist._id,
        duration: 180
      });

      const songs = await songRepository.searchByArtist(artist._id, 'hello');
      expect(songs).toHaveLength(1);
    });

    it('should return all artist songs when no query provided', async () => {
      await Song.create([
        { title: 'Song 1', artist: artist._id, duration: 180 },
        { title: 'Song 2', artist: artist._id, duration: 200 }
      ]);

      const songs = await songRepository.searchByArtist(artist._id);
      expect(songs).toHaveLength(2);
    });

    it('should sort by playCount', async () => {
      await Song.create([
        { title: 'Hello 1', artist: artist._id, duration: 180, playCount: 100 },
        { title: 'Hello 2', artist: artist._id, duration: 200, playCount: 500 }
      ]);

      const songs = await songRepository.searchByArtist(artist._id, 'Hello');
      expect(songs[0].playCount).toBeGreaterThan(songs[1].playCount);
    });
  });

  describe('findByGenre', () => {
    it('should find songs by genre', async () => {
      await Song.create([
        { title: 'Rock Song', artist: artist._id, duration: 180, genres: ['Rock'] },
        { title: 'Pop Song', artist: artist._id, duration: 200, genres: ['Pop'] },
        { title: 'Rock Pop Song', artist: artist._id, duration: 190, genres: ['Rock', 'Pop'] }
      ]);

      const rockSongs = await songRepository.findByGenre('Rock');
      expect(rockSongs).toHaveLength(2);
    });

    it('should return empty array when no songs match genre', async () => {
      await Song.create({
        title: 'Rock Song',
        artist: artist._id,
        duration: 180,
        genres: ['Rock']
      });

      const jazzSongs = await songRepository.findByGenre('Jazz');
      expect(jazzSongs).toEqual([]);
    });
  });

  describe('search', () => {
    it('should search by title', async () => {
      await Song.create([
        { title: 'Dancing Queen', artist: artist._id, duration: 180 },
        { title: 'King of Pop', artist: artist._id, duration: 200 },
        { title: 'Dance Floor', artist: artist._id, duration: 190 }
      ]);

      const songs = await songRepository.search('Danc');
      expect(songs.length).toBeGreaterThanOrEqual(2);
    });

    it('should search by genre', async () => {
      await Song.create([
        { title: 'Song 1', artist: artist._id, duration: 180, genres: ['Jazz'] },
        { title: 'Song 2', artist: artist._id, duration: 200, genres: ['Rock'] },
        { title: 'Song 3', artist: artist._id, duration: 190, genres: ['Jazz'] }
      ]);

      const songs = await songRepository.search('Jazz');
      expect(songs).toHaveLength(2);
    });

    it('should be case-insensitive', async () => {
      await Song.create({
        title: 'Hello World',
        artist: artist._id,
        duration: 180
      });

      const songs = await songRepository.search('hello');
      expect(songs).toHaveLength(1);
    });

    it('should populate artist and album', async () => {
      await Song.create({
        title: 'Test Song',
        artist: artist._id,
        album: album._id,
        duration: 180
      });

      const songs = await songRepository.search('Test');
      expect(songs[0].artist.name).toBe('Test Artist');
      expect(songs[0].album.title).toBe('Test Album');
    });

    it('should search across title and genre', async () => {
      await Song.create([
        { title: 'Rock Anthem', artist: artist._id, duration: 180, genres: ['Rock'] },
        { title: 'Pop Song', artist: artist._id, duration: 200, genres: ['Rock'] },
        { title: 'Jazz Night', artist: artist._id, duration: 190, genres: ['Jazz'] }
      ]);

      const songs = await songRepository.search('Rock');
      expect(songs).toHaveLength(2);
    });
  });
});
