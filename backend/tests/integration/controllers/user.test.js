import { describe, it, expect, beforeEach } from 'vitest';
import User from '../../../models/User.js';
import Artist from '../../../models/Artist.js';
import Album from '../../../models/Album.js';
import Song from '../../../models/Song.js';
import userRepository from '../../../repositories/userRepository.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('User Integration Tests', () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe('User CRUD operations', () => {
    it('should create and retrieve a user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const created = await userRepository.create(userData);
      const retrieved = await userRepository.findById(created._id);

      expect(retrieved.username).toBe('testuser');
      expect(retrieved.email).toBe('test@example.com');
      expect(retrieved.role).toBe('user');
      expect(retrieved.password).toBeUndefined(); // Should not be selected by default
    });

    it('should create admin user', async () => {
      const adminData = {
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const admin = await userRepository.create(adminData);
      expect(admin.role).toBe('admin');
    });

    it('should update user information', async () => {
      const user = await userRepository.create({
        username: 'oldname',
        email: 'old@example.com',
        password: 'password123'
      });

      const updated = await userRepository.update(user._id, {
        username: 'newname',
        email: 'new@example.com'
      });

      expect(updated.username).toBe('newname');
      expect(updated.email).toBe('new@example.com');
    });

    it('should delete a user', async () => {
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      await userRepository.delete(user._id);
      const deleted = await userRepository.findById(user._id);
      expect(deleted).toBeNull();
    });
  });

  describe('User authentication operations', () => {
    it('should find user by email with password for authentication', async () => {
      await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByEmailWithPassword('test@example.com');
      expect(user).toBeDefined();
      expect(user.password).toBeDefined();
      expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash
    });

    it('should find user by username with password for authentication', async () => {
      await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByUsernameWithPassword('testuser');
      expect(user).toBeDefined();
      expect(user.password).toBeDefined();
    });

    it('should verify correct password', async () => {
      await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByEmailWithPassword('test@example.com');
      const isValid = await user.comparePassword('password123');
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByEmailWithPassword('test@example.com');
      const isValid = await user.comparePassword('wrongpassword');
      expect(isValid).toBe(false);
    });

    it('should update user password', async () => {
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'oldpassword123'
      });

      await userRepository.updatePassword(user._id, 'newpassword123');

      const updatedUser = await userRepository.findByEmailWithPassword('test@example.com');
      const isValid = await updatedUser.comparePassword('newpassword123');
      expect(isValid).toBe(true);
    });
  });

  describe('User library operations', () => {
    let user, artist, album, song1, song2;

    beforeEach(async () => {
      user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      artist = await Artist.create({
        name: 'Test Artist',
        country: 'USA'
      });

      album = await Album.create({
        title: 'Test Album',
        artist: artist._id,
        releaseYear: 2020
      });

      song1 = await Song.create({
        title: 'Test Song 1',
        artist: artist._id,
        album: album._id,
        duration: 180
      });

      song2 = await Song.create({
        title: 'Test Song 2',
        artist: artist._id,
        album: album._id,
        duration: 200
      });
    });

    describe('Liked songs', () => {
      it('should like a song', async () => {
        const updated = await userRepository.likeSong(user._id, song1._id);
        expect(updated.likedSongs).toHaveLength(1);
        expect(updated.likedSongs[0]._id.toString()).toBe(song1._id.toString());
      });

      it('should like multiple songs', async () => {
        await userRepository.likeSong(user._id, song1._id);
        await userRepository.likeSong(user._id, song2._id);

        const library = await userRepository.getUserLibrary(user._id);
        expect(library.likedSongs).toHaveLength(2);
      });

      it('should unlike a song', async () => {
        await userRepository.likeSong(user._id, song1._id);
        await userRepository.likeSong(user._id, song2._id);
        
        const updated = await userRepository.unlikeSong(user._id, song1._id);
        expect(updated.likedSongs).toHaveLength(1);
        expect(updated.likedSongs[0]._id.toString()).toBe(song2._id.toString());
      });

      it('should not add duplicate liked songs', async () => {
        await userRepository.likeSong(user._id, song1._id);
        await userRepository.likeSong(user._id, song1._id);

        const library = await userRepository.getUserLibrary(user._id);
        expect(library.likedSongs).toHaveLength(1);
      });
    });

    describe('Saved albums', () => {
      it('should save an album', async () => {
        const updated = await userRepository.saveAlbum(user._id, album._id);
        expect(updated.savedAlbums).toHaveLength(1);
        expect(updated.savedAlbums[0]._id.toString()).toBe(album._id.toString());
      });

      it('should unsave an album', async () => {
        await userRepository.saveAlbum(user._id, album._id);
        const updated = await userRepository.unsaveAlbum(user._id, album._id);
        expect(updated.savedAlbums).toHaveLength(0);
      });

      it('should not add duplicate saved albums', async () => {
        await userRepository.saveAlbum(user._id, album._id);
        await userRepository.saveAlbum(user._id, album._id);

        const library = await userRepository.getUserLibrary(user._id);
        expect(library.savedAlbums).toHaveLength(1);
      });
    });

    describe('Followed artists', () => {
      it('should follow an artist', async () => {
        const updated = await userRepository.followArtist(user._id, artist._id);
        expect(updated.followedArtists).toHaveLength(1);
        expect(updated.followedArtists[0]._id.toString()).toBe(artist._id.toString());
      });

      it('should unfollow an artist', async () => {
        await userRepository.followArtist(user._id, artist._id);
        const updated = await userRepository.unfollowArtist(user._id, artist._id);
        expect(updated.followedArtists).toHaveLength(0);
      });

      it('should not add duplicate followed artists', async () => {
        await userRepository.followArtist(user._id, artist._id);
        await userRepository.followArtist(user._id, artist._id);

        const library = await userRepository.getUserLibrary(user._id);
        expect(library.followedArtists).toHaveLength(1);
      });
    });

    describe('Complete library', () => {
      it('should retrieve complete user library', async () => {
        await userRepository.likeSong(user._id, song1._id);
        await userRepository.likeSong(user._id, song2._id);
        await userRepository.saveAlbum(user._id, album._id);
        await userRepository.followArtist(user._id, artist._id);

        const library = await userRepository.getUserLibrary(user._id);

        expect(library.likedSongs).toHaveLength(2);
        expect(library.savedAlbums).toHaveLength(1);
        expect(library.followedArtists).toHaveLength(1);
      });

      it('should populate library references', async () => {
        await userRepository.likeSong(user._id, song1._id);
        await userRepository.saveAlbum(user._id, album._id);
        await userRepository.followArtist(user._id, artist._id);

        const library = await userRepository.getUserLibrary(user._id);

        expect(library.likedSongs[0].title).toBe('Test Song 1');
        expect(library.savedAlbums[0].title).toBe('Test Album');
        expect(library.followedArtists[0].name).toBe('Test Artist');
      });
    });
  });

  describe('User validation', () => {
    it('should enforce unique username', async () => {
      await userRepository.create({
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123'
      });

      await expect(
        userRepository.create({
          username: 'testuser',
          email: 'test2@example.com',
          password: 'password123'
        })
      ).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      await userRepository.create({
        username: 'user1',
        email: 'test@example.com',
        password: 'password123'
      });

      await expect(
        userRepository.create({
          username: 'user2',
          email: 'test@example.com',
          password: 'password123'
        })
      ).rejects.toThrow();
    });

    it('should enforce minimum username length', async () => {
      await expect(
        userRepository.create({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123'
        })
      ).rejects.toThrow();
    });

    it('should enforce minimum password length', async () => {
      await expect(
        userRepository.create({
          username: 'testuser',
          email: 'test@example.com',
          password: 'pass123'
        })
      ).rejects.toThrow();
    });

    it('should validate email format', async () => {
      await expect(
        userRepository.create({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123'
        })
      ).rejects.toThrow();
    });

    it('should only allow user or admin role', async () => {
      await expect(
        userRepository.create({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'superuser'
        })
      ).rejects.toThrow();
    });
  });

  describe('User existence checks', () => {
    it('should detect existing email', async () => {
      await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const exists = await userRepository.exists('test@example.com', 'newuser');
      expect(exists).toBeDefined();
      expect(exists.email).toBe('test@example.com');
    });

    it('should detect existing username', async () => {
      await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const exists = await userRepository.exists('new@example.com', 'testuser');
      expect(exists).toBeDefined();
      expect(exists.username).toBe('testuser');
    });

    it('should return null if neither exists', async () => {
      const exists = await userRepository.exists('new@example.com', 'newuser');
      expect(exists).toBeNull();
    });
  });

  describe('User counting', () => {
    it('should count total users', async () => {
      await userRepository.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123'
      });

      await userRepository.create({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123'
      });

      const count = await userRepository.countUsers();
      expect(count).toBe(2);
    });
  });

  describe('Case sensitivity', () => {
    it('should handle email case-insensitively', async () => {
      await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByEmail('TEST@EXAMPLE.COM');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should store email in lowercase', async () => {
      const user = await userRepository.create({
        username: 'testuser',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      });

      expect(user.email).toBe('test@example.com');
    });
  });
});
