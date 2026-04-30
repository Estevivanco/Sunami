import { describe, it, expect, beforeEach } from 'vitest';
import Album from '../../../models/Album.js';
import Artist from '../../../models/Artist.js';
import Song from '../../../models/Song.js';
import albumRepository from '../../../repositories/albumRepository.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('Album Integration Tests', () => {
  let artist;

  beforeEach(async () => {
    await clearDb();
    artist = await Artist.create({ name: 'Test Artist', country: 'USA' });
  });

  describe('Album CRUD operations', () => {
    it('should create and retrieve an album', async () => {
      const albumData = {
        title: 'Test Album',
        artist: artist._id,
        releaseDate: new Date('2020-01-01'),
        genres: ['Rock', 'Alternative']
      };

      const created = await albumRepository.create(albumData);
      const retrieved = await albumRepository.findById(created._id);

      expect(retrieved.title).toBe('Test Album');
      expect(retrieved.artist.name).toBe('Test Artist');
      expect(retrieved.genres).toEqual(['Rock', 'Alternative']);
    });

    it('should update album information', async () => {
      const album = await albumRepository.create({
        title: 'Old Title',
        artist: artist._id
      });

      const updated = await albumRepository.update(album._id, {
        title: 'New Title',
        genres: ['Pop']
      });

      expect(updated.title).toBe('New Title');
      expect(updated.genres).toEqual(['Pop']);
    });

    it('should delete an album', async () => {
      const album = await albumRepository.create({
        title: 'Test Album',
        artist: artist._id
      });

      await albumRepository.delete(album._id);
      const deleted = await albumRepository.findById(album._id);
      expect(deleted).toBeNull();
    });
  });

  describe('Album with songs', () => {
    it('should create album with songs', async () => {
      const album = await albumRepository.create({
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

      const retrieved = await albumRepository.findById(album._id);
      expect(retrieved.songs).toHaveLength(2);
      expect(retrieved.totalTracks).toBe(2);
    });

    it('should populate song details', async () => {
      const album = await albumRepository.create({
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

      const retrieved = await albumRepository.findById(album._id, true);
      expect(retrieved.songs[0].title).toBe('Test Song');
      expect(retrieved.songs[0].artist.name).toBe('Test Artist');
    });
  });

  describe('Album artist relationships', () => {
    it('should find all albums by artist', async () => {
      await albumRepository.create({
        title: 'Album 1',
        artist: artist._id
      });

      await albumRepository.create({
        title: 'Album 2',
        artist: artist._id
      });

      const albums = await albumRepository.findByArtist(artist._id);
      expect(albums).toHaveLength(2);
      expect(albums[0].artist.name).toBe('Test Artist');
      expect(albums[1].artist.name).toBe('Test Artist');
    });

    it('should count albums by artist', async () => {
      await albumRepository.create({ title: 'Album 1', artist: artist._id });
      await albumRepository.create({ title: 'Album 2', artist: artist._id });
      await albumRepository.create({ title: 'Album 3', artist: artist._id });

      const count = await albumRepository.countByArtist(artist._id);
      expect(count).toBe(3);
    });

    it('should prevent changing artist on existing album', async () => {
      const artist2 = await Artist.create({ name: 'Another Artist', country: 'UK' });
      
      const album = await albumRepository.create({
        title: 'Test Album',
        artist: artist._id
      });

      const retrieved = await Album.findById(album._id);
      retrieved.artist = artist2._id;

      await expect(retrieved.save()).rejects.toThrow('Cannot change artist of an existing album');
    });
  });

  describe('Album genre search', () => {
    it('should find albums by genre', async () => {
      await albumRepository.create({
        title: 'Rock Album 1',
        artist: artist._id,
        genres: ['Rock']
      });

      await albumRepository.create({
        title: 'Rock Album 2',
        artist: artist._id,
        genres: ['Rock', 'Alternative']
      });

      await albumRepository.create({
        title: 'Pop Album',
        artist: artist._id,
        genres: ['Pop']
      });

      const rockAlbums = await albumRepository.findByGenre('Rock');
      expect(rockAlbums).toHaveLength(2);
    });

    it('should handle multiple genres per album', async () => {
      await albumRepository.create({
        title: 'Multi-genre Album',
        artist: artist._id,
        genres: ['Rock', 'Pop', 'Alternative']
      });

      const rockAlbums = await albumRepository.findByGenre('Rock');
      const popAlbums = await albumRepository.findByGenre('Pop');
      const altAlbums = await albumRepository.findByGenre('Alternative');

      expect(rockAlbums).toHaveLength(1);
      expect(popAlbums).toHaveLength(1);
      expect(altAlbums).toHaveLength(1);
    });
  });

  describe('Album validation', () => {
    it('should require artist to exist', async () => {
      const fakeArtistId = '507f1f77bcf86cd799439011';

      await expect(
        albumRepository.create({
          title: 'Test Album',
          artist: fakeArtistId
        })
      ).rejects.toThrow('Artist not found');
    });

    it('should require valid songs', async () => {
      const fakeSongId = '507f1f77bcf86cd799439011';

      await expect(
        albumRepository.create({
          title: 'Test Album',
          artist: artist._id,
          songs: [fakeSongId]
        })
      ).rejects.toThrow('One or more songs not found');
    });

    it('should require title', async () => {
      await expect(
        albumRepository.create({
          artist: artist._id
        })
      ).rejects.toThrow();
    });
  });

  describe('Multiple artists scenario', () => {
    it('should maintain separate album collections per artist', async () => {
      const artist2 = await Artist.create({ name: 'Artist 2', country: 'UK' });
      const artist3 = await Artist.create({ name: 'Artist 3', country: 'Canada' });

      await albumRepository.create({ title: 'Artist 1 Album 1', artist: artist._id });
      await albumRepository.create({ title: 'Artist 1 Album 2', artist: artist._id });
      await albumRepository.create({ title: 'Artist 2 Album 1', artist: artist2._id });
      await albumRepository.create({ title: 'Artist 3 Album 1', artist: artist3._id });

      const artist1Albums = await albumRepository.findByArtist(artist._id);
      const artist2Albums = await albumRepository.findByArtist(artist2._id);
      const artist3Albums = await albumRepository.findByArtist(artist3._id);

      expect(artist1Albums).toHaveLength(2);
      expect(artist2Albums).toHaveLength(1);
      expect(artist3Albums).toHaveLength(1);
    });
  });

  describe('Album population options', () => {
    it('should support different populate options', async () => {
      const album = await albumRepository.create({
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

      // Test populate=true
      const fullPopulate = await albumRepository.findById(album._id, true);
      expect(fullPopulate.artist.name).toBe('Test Artist');
      expect(fullPopulate.songs[0].title).toBe('Test Song');

      // Test populate=false
      const noPopulate = await albumRepository.findById(album._id, false);
      expect(noPopulate.artist.name).toBeUndefined();
      expect(noPopulate.songs[0].title).toBeUndefined();
    });

    it('should support artist-only populate in findAll', async () => {
      await albumRepository.create({
        title: 'Test Album',
        artist: artist._id
      });

      const albums = await albumRepository.findAll('artist');
      expect(albums[0].artist.name).toBe('Test Artist');
    });
  });
});
