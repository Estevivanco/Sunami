import { describe, it, expect, beforeEach } from 'vitest';
import User from '../../../models/User.js';
import { connectTestDb, closeTestDb, clearDb } from '../../setup/setup.js';

describe('User Model', () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe('Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('user'); // default role
      expect(user.password).not.toBe('password123'); // should be hashed
    });

    it('should require username', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require email', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce minimum username length of 3', async () => {
      const userData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce minimum password length of 8', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should trim username', async () => {
      const userData = {
        username: '  testuser  ',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      expect(user.username).toBe('testuser');
    });

    it('should trim and lowercase email', async () => {
      const userData = {
        username: 'testuser',
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123'
      };

      const user = await User.create(userData);
      expect(user.email).toBe('test@example.com');
    });

    it('should enforce unique username', async () => {
      const userData1 = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123'
      };

      const userData2 = {
        username: 'testuser',
        email: 'test2@example.com',
        password: 'password123'
      };

      await User.create(userData1);
      await expect(User.create(userData2)).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData1 = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123'
      };

      const userData2 = {
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123'
      };

      await User.create(userData1);
      await expect(User.create(userData2)).rejects.toThrow();
    });

    it('should only allow user or admin role', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'superuser'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should allow admin role', async () => {
      const userData = {
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const user = await User.create(userData);
      expect(user.role).toBe('admin');
    });
  });

  describe('Default values', () => {
    it('should default role to user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      expect(user.role).toBe('user');
    });

    it('should default likedSongs to empty array', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      expect(user.likedSongs).toEqual([]);
    });

    it('should default savedAlbums to empty array', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      expect(user.savedAlbums).toEqual([]);
    });

    it('should default followedArtists to empty array', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      expect(user.followedArtists).toEqual([]);
    });
  });

  describe('Timestamps', () => {
    it('should add createdAt timestamp', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should add updatedAt timestamp', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Password hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      
      // Fetch user with password field
      const userWithPassword = await User.findById(user._id).select('+password');
      
      expect(userWithPassword.password).not.toBe('password123');
      expect(userWithPassword.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should not rehash password if not modified', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const userWithPassword = await User.findById(user._id).select('+password');
      const originalHash = userWithPassword.password;

      // Update username only
      user.username = 'newusername';
      await user.save();

      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser.password).toBe(originalHash);
    });
  });

  describe('Password comparison', () => {
    it('should correctly compare valid password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const userWithPassword = await User.findById(user._id).select('+password');
      
      const isMatch = await userWithPassword.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    it('should reject invalid password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const userWithPassword = await User.findById(user._id).select('+password');
      
      const isMatch = await userWithPassword.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('Password field selection', () => {
    it('should not include password by default', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const foundUser = await User.findById(user._id);
      
      expect(foundUser.password).toBeUndefined();
    });

    it('should include password when explicitly selected', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const userWithPassword = await User.findById(user._id).select('+password');
      
      expect(userWithPassword.password).toBeDefined();
      expect(userWithPassword.password).toMatch(/^\$2[aby]\$/);
    });
  });
});
