import { describe, it, expect, beforeEach } from 'vitest';
import userRepository from '../../../repositories/userRepository.js';
import User from '../../../models/User.js';
import Song from '../../../models/Song.js';
import Album from '../../../models/Album.js';
import Artist from '../../../models/Artist.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('User Repository', () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      await User.create([
        { username: 'user1', email: 'user1@example.com', password: 'password123' },
        { username: 'user2', email: 'user2@example.com', password: 'password123' }
      ]);

      const users = await userRepository.findAll();
      expect(users).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      const users = await userRepository.findAll();
      expect(users).toEqual([]);
    });

    it('should not include password field by default', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const users = await userRepository.findAll();
      expect(users[0].password).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const foundUser = await userRepository.findById(user._id);
      expect(foundUser.username).toBe('testuser');
      expect(foundUser.email).toBe('test@example.com');
    });

    it('should return null for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const user = await userRepository.findById(fakeId);
      expect(user).toBeNull();
    });

    it('should not include password field', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const foundUser = await userRepository.findById(user._id);
      expect(foundUser.password).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });

    it('should be case-insensitive', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByEmail('TEST@EXAMPLE.COM');
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });

    it('should return null for non-existent email', async () => {
      const user = await userRepository.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });

    it('should not include password field', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByEmail('test@example.com');
      expect(user.password).toBeUndefined();
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByUsername('testuser');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should return null for non-existent username', async () => {
      const user = await userRepository.findByUsername('nonexistent');
      expect(user).toBeNull();
    });

    it('should not include password field', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByUsername('testuser');
      expect(user.password).toBeUndefined();
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should find user by email and include password', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByEmailWithPassword('test@example.com');
      expect(user).toBeDefined();
      expect(user.password).toBeDefined();
      expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash
    });

    it('should be case-insensitive', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByEmailWithPassword('TEST@EXAMPLE.COM');
      expect(user).toBeDefined();
      expect(user.password).toBeDefined();
    });

    it('should return null for non-existent email', async () => {
      const user = await userRepository.findByEmailWithPassword('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findByUsernameWithPassword', () => {
    it('should find user by username and include password', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await userRepository.findByUsernameWithPassword('testuser');
      expect(user).toBeDefined();
      expect(user.password).toBeDefined();
      expect(user.password).toMatch(/^\$2[aby]\$/);
    });

    it('should return null for non-existent username', async () => {
      const user = await userRepository.findByUsernameWithPassword('nonexistent');
      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      };

      const user = await userRepository.create(userData);
      expect(user.username).toBe('newuser');
      expect(user.email).toBe('new@example.com');
      expect(user._id).toBeDefined();
    });

    it('should create user with admin role', async () => {
      const userData = {
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const user = await userRepository.create(userData);
      expect(user.role).toBe('admin');
    });

    it('should hash password during creation', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      };

      const user = await userRepository.create(userData);
      const userWithPassword = await User.findById(user._id).select('+password');
      
      expect(userWithPassword.password).not.toBe('password123');
      expect(userWithPassword.password).toMatch(/^\$2[aby]\$/);
    });

    it('should reject duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await userRepository.create(userData);
      
      await expect(
        userRepository.create({
          username: 'testuser',
          email: 'other@example.com',
          password: 'password123'
        })
      ).rejects.toThrow();
    });

    it('should reject duplicate email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await userRepository.create(userData);
      
      await expect(
        userRepository.create({
          username: 'otheruser',
          email: 'test@example.com',
          password: 'password123'
        })
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update user username', async () => {
      const user = await User.create({
        username: 'oldname',
        email: 'test@example.com',
        password: 'password123'
      });

      const updated = await userRepository.update(user._id, { username: 'newname' });
      expect(updated.username).toBe('newname');
    });

    it('should update user email', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'old@example.com',
        password: 'password123'
      });

      const updated = await userRepository.update(user._id, { email: 'new@example.com' });
      expect(updated.email).toBe('new@example.com');
    });

    it('should update user role', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const updated = await userRepository.update(user._id, { role: 'admin' });
      expect(updated.role).toBe('admin');
    });

    it('should return null for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updated = await userRepository.update(fakeId, { username: 'newname' });
      expect(updated).toBeNull();
    });

    it('should run validators on update', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      await expect(
        userRepository.update(user._id, { email: 'invalid-email' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const deleted = await userRepository.delete(user._id);
      expect(deleted._id.toString()).toBe(user._id.toString());

      const foundUser = await User.findById(user._id);
      expect(foundUser).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const deleted = await userRepository.delete(fakeId);
      expect(deleted).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return user if email exists', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const exists = await userRepository.exists('test@example.com', 'otheruser');
      expect(exists).toBeDefined();
      expect(exists.email).toBe('test@example.com');
    });

    it('should return user if username exists', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const exists = await userRepository.exists('other@example.com', 'testuser');
      expect(exists).toBeDefined();
      expect(exists.username).toBe('testuser');
    });

    it('should be case-insensitive for email', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const exists = await userRepository.exists('TEST@EXAMPLE.COM', 'otheruser');
      expect(exists).toBeDefined();
    });

    it('should return null if neither exists', async () => {
      const exists = await userRepository.exists('new@example.com', 'newuser');
      expect(exists).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'oldpassword123'
      });

      const oldPasswordHash = (await User.findById(user._id).select('+password')).password;

      await userRepository.updatePassword(user._id, 'newpassword123');

      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser.password).not.toBe(oldPasswordHash);
      expect(updatedUser.password).toMatch(/^\$2[aby]\$/);

      // Verify new password works
      const isMatch = await updatedUser.comparePassword('newpassword123');
      expect(isMatch).toBe(true);
    });

    it('should return null for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await userRepository.updatePassword(fakeId, 'newpassword123');
      expect(result).toBeNull();
    });

    it('should hash the new password', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'oldpassword123'
      });

      await userRepository.updatePassword(user._id, 'newpassword123');

      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser.password).not.toBe('newpassword123');
    });
  });

  describe('countUsers', () => {
    it('should return 0 when no users exist', async () => {
      const count = await userRepository.countUsers();
      expect(count).toBe(0);
    });

    it('should count all users', async () => {
      await User.create([
        { username: 'user1', email: 'user1@example.com', password: 'password123' },
        { username: 'user2', email: 'user2@example.com', password: 'password123' },
        { username: 'user3', email: 'user3@example.com', password: 'password123' }
      ]);

      const count = await userRepository.countUsers();
      expect(count).toBe(3);
    });
  });

  describe('Library operations', () => {
    let user, artist, album, song;

    beforeEach(async () => {
      // Create test data
      user = await User.create({
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

      song = await Song.create({
        title: 'Test Song',
        artist: artist._id,
        album: album._id,
        duration: 180
      });
    });

    describe('likeSong', () => {
      it('should add song to likedSongs', async () => {
        const updated = await userRepository.likeSong(user._id, song._id);
        expect(updated.likedSongs).toHaveLength(1);
        expect(updated.likedSongs[0]._id.toString()).toBe(song._id.toString());
      });

      it('should not add duplicate songs', async () => {
        await userRepository.likeSong(user._id, song._id);
        const updated = await userRepository.likeSong(user._id, song._id);
        expect(updated.likedSongs).toHaveLength(1);
      });
    });

    describe('unlikeSong', () => {
      it('should remove song from likedSongs', async () => {
        await userRepository.likeSong(user._id, song._id);
        const updated = await userRepository.unlikeSong(user._id, song._id);
        expect(updated.likedSongs).toHaveLength(0);
      });

      it('should handle removing non-existent song', async () => {
        const updated = await userRepository.unlikeSong(user._id, song._id);
        expect(updated.likedSongs).toHaveLength(0);
      });
    });

    describe('saveAlbum', () => {
      it('should add album to savedAlbums', async () => {
        const updated = await userRepository.saveAlbum(user._id, album._id);
        expect(updated.savedAlbums).toHaveLength(1);
        expect(updated.savedAlbums[0]._id.toString()).toBe(album._id.toString());
      });

      it('should not add duplicate albums', async () => {
        await userRepository.saveAlbum(user._id, album._id);
        const updated = await userRepository.saveAlbum(user._id, album._id);
        expect(updated.savedAlbums).toHaveLength(1);
      });
    });

    describe('unsaveAlbum', () => {
      it('should remove album from savedAlbums', async () => {
        await userRepository.saveAlbum(user._id, album._id);
        const updated = await userRepository.unsaveAlbum(user._id, album._id);
        expect(updated.savedAlbums).toHaveLength(0);
      });
    });

    describe('followArtist', () => {
      it('should add artist to followedArtists', async () => {
        const updated = await userRepository.followArtist(user._id, artist._id);
        expect(updated.followedArtists).toHaveLength(1);
        expect(updated.followedArtists[0]._id.toString()).toBe(artist._id.toString());
      });

      it('should not add duplicate artists', async () => {
        await userRepository.followArtist(user._id, artist._id);
        const updated = await userRepository.followArtist(user._id, artist._id);
        expect(updated.followedArtists).toHaveLength(1);
      });
    });

    describe('unfollowArtist', () => {
      it('should remove artist from followedArtists', async () => {
        await userRepository.followArtist(user._id, artist._id);
        const updated = await userRepository.unfollowArtist(user._id, artist._id);
        expect(updated.followedArtists).toHaveLength(0);
      });
    });

    describe('getUserLibrary', () => {
      it('should return user library with all collections', async () => {
        await userRepository.likeSong(user._id, song._id);
        await userRepository.saveAlbum(user._id, album._id);
        await userRepository.followArtist(user._id, artist._id);

        const library = await userRepository.getUserLibrary(user._id);
        
        expect(library.likedSongs).toHaveLength(1);
        expect(library.savedAlbums).toHaveLength(1);
        expect(library.followedArtists).toHaveLength(1);
      });

      it('should return null for non-existent user', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        const library = await userRepository.getUserLibrary(fakeId);
        expect(library).toBeNull();
      });
    });
  });
});
