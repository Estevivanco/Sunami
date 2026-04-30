import { describe, it, expect, beforeEach } from 'vitest';
import albumRepository from '../../../repositories/albumRepository.js';
import Album from '../../../models/Album.js';
import Artist from '../../../models/Artist.js';
import Song from '../../../models/Song.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('Album Repository', () => {
  let artist;

  beforeEach(async () => {
    await clearDb();
    artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
  });

  describe('findAll', () => {
    it('should return all albums', async () => {
      await Album.create([
        { title: 'Album 1', artist: artist._id },
        { title: 'Album 2', artist: artist._id }
      ]);

      const albums = await albumRepository.findAll();
      expect(albums).toHaveLength(2);
    });

    it('should return empty array when no albums exist', async () => {
      const albums = await albumRepository.findAll();
      expect(albums).toEqual([]);
    });

    it('should populate artist by default', async () => {
      await Album.create({ title: 'Test Album', artist: artist._id });

      const albums = await albumRepository.findAll();
      expect(albums[0].artist.name).toBe('Test Artist');
    });

    it('should populate artist only when populate is "artist"', async () => {
      await Album.create({ title: 'Test Album', artist: artist._id });

      const albums = await albumRepository.findAll('artist');
      expect(albums[0].artist.name).toBe('Test Artist');
    });

    it('should not populate when populate is false', async () => {
      await Album.create({ title: 'Test Album', artist: artist._id });

      const albums = await albumRepository.findAll(false);
      expect(albums[0].artist.name).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find album by ID', async () => {
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      const found = await albumRepository.findById(album._id);
      expect(found.title).toBe('Test Album');
      expect(found.artist.name).toBe('Test Artist');
    });

    it('should return null for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const album = await albumRepository.findById(fakeId);
      expect(album).toBeNull();
    });

    it('should populate artist and songs when populate is true', async () => {
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

      const found = await albumRepository.findById(album._id, true);
      expect(found.artist.name).toBe('Test Artist');
      expect(found.songs).toHaveLength(1);
      expect(found.songs[0].title).toBe('Test Song');
    });

    it('should not populate when populate is false', async () => {
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      const found = await albumRepository.findById(album._id, false);
      expect(found.artist.name).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new album', async () => {
      const albumData = {
        title: 'New Album',
        artist: artist._id,
        releaseDate: new Date('2020-01-01')
      };

      const album = await albumRepository.create(albumData);
      expect(album.title).toBe('New Album');
      expect(album.artist.toString()).toBe(artist._id.toString());
      expect(album._id).toBeDefined();
    });

    it('should create album with genres', async () => {
      const albumData = {
        title: 'New Album',
        artist: artist._id,
        genres: ['Rock', 'Alternative']
      };

      const album = await albumRepository.create(albumData);
      expect(album.genres).toEqual(['Rock', 'Alternative']);
    });

    it('should reject invalid album data', async () => {
      const albumData = {
        artist: artist._id
        // missing title
      };

      await expect(albumRepository.create(albumData)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update album title', async () => {
      const album = await Album.create({
        title: 'Old Title',
        artist: artist._id
      });

      const updated = await albumRepository.update(album._id, { title: 'New Title' });
      expect(updated.title).toBe('New Title');
    });

    it('should update album genres', async () => {
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      const updated = await albumRepository.update(album._id, {
        genres: ['Pop', 'Electronic']
      });
      expect(updated.genres).toEqual(['Pop', 'Electronic']);
    });

    it('should return null for non-existent album', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updated = await albumRepository.update(fakeId, { title: 'New Title' });
      expect(updated).toBeNull();
    });

    it('should run validators on update', async () => {
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      await expect(
        albumRepository.update(album._id, { title: '' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete an album', async () => {
      const album = await Album.create({
        title: 'Test Album',
        artist: artist._id
      });

      const deleted = await albumRepository.delete(album._id);
      expect(deleted._id.toString()).toBe(album._id.toString());

      const found = await Album.findById(album._id);
      expect(found).toBeNull();
    });

    it('should return null for non-existent album', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const deleted = await albumRepository.delete(fakeId);
      expect(deleted).toBeNull();
    });
  });

  describe('findByArtist', () => {
    it('should find all albums by artist', async () => {
      const artist2 = await Artist.create({ name: 'Another Artist', country: 'UK' });

      await Album.create([
        { title: 'Album 1', artist: artist._id },
        { title: 'Album 2', artist: artist._id },
        { title: 'Album 3', artist: artist2._id }
      ]);

      const albums = await albumRepository.findByArtist(artist._id);
      expect(albums).toHaveLength(2);
      expect(albums[0].artist.name).toBe('Test Artist');
      expect(albums[1].artist.name).toBe('Test Artist');
    });

    it('should return empty array when artist has no albums', async () => {
      const artist2 = await Artist.create({ name: 'No Albums Artist', country: 'Canada' });
      
      const albums = await albumRepository.findByArtist(artist2._id);
      expect(albums).toEqual([]);
    });

    it('should populate artist and songs', async () => {
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

      const albums = await albumRepository.findByArtist(artist._id);
      expect(albums[0].artist.name).toBe('Test Artist');
      expect(albums[0].songs).toHaveLength(1);
    });
  });

  describe('findByGenre', () => {
    it('should find albums by genre', async () => {
      await Album.create([
        { title: 'Rock Album', artist: artist._id, genres: ['Rock'] },
        { title: 'Pop Album', artist: artist._id, genres: ['Pop'] },
        { title: 'Rock Pop Album', artist: artist._id, genres: ['Rock', 'Pop'] }
      ]);

      const rockAlbums = await albumRepository.findByGenre('Rock');
      expect(rockAlbums).toHaveLength(2);
    });

    it('should return empty array when no albums match genre', async () => {
      await Album.create({
        title: 'Test Album',
        artist: artist._id,
        genres: ['Rock']
      });

      const jazzAlbums = await albumRepository.findByGenre('Jazz');
      expect(jazzAlbums).toEqual([]);
    });

    it('should populate artist', async () => {
      await Album.create({
        title: 'Rock Album',
        artist: artist._id,
        genres: ['Rock']
      });

      const albums = await albumRepository.findByGenre('Rock');
      expect(albums[0].artist.name).toBe('Test Artist');
    });

    it('should be case-sensitive', async () => {
      await Album.create({
        title: 'Rock Album',
        artist: artist._id,
        genres: ['Rock']
      });

      const albums = await albumRepository.findByGenre('rock');
      expect(albums).toEqual([]);
    });
  });

  describe('countByArtist', () => {
    it('should count albums by artist', async () => {
      await Album.create([
        { title: 'Album 1', artist: artist._id },
        { title: 'Album 2', artist: artist._id },
        { title: 'Album 3', artist: artist._id }
      ]);

      const count = await albumRepository.countByArtist(artist._id);
      expect(count).toBe(3);
    });

    it('should return 0 when artist has no albums', async () => {
      const artist2 = await Artist.create({ name: 'No Albums Artist', country: 'Canada' });
      
      const count = await albumRepository.countByArtist(artist2._id);
      expect(count).toBe(0);
    });

    it('should only count albums for specified artist', async () => {
      const artist2 = await Artist.create({ name: 'Another Artist', country: 'UK' });

      await Album.create([
        { title: 'Album 1', artist: artist._id },
        { title: 'Album 2', artist: artist._id },
        { title: 'Album 3', artist: artist2._id }
      ]);

      const count = await albumRepository.countByArtist(artist._id);
      expect(count).toBe(2);
    });
  });
});
