/**
 * Custom assertion helpers for tests
 */
import { expect } from "vitest";

/**
 * Assert that an object has valid MongoDB _id and timestamps
 */
export const expectValidDocument = (doc) => {
  expect(doc).toBeDefined();
  expect(doc._id).toBeDefined();
  expect(doc.createdAt).toBeInstanceOf(Date);
  expect(doc.updatedAt).toBeInstanceOf(Date);
};

/**
 * Assert that an artist has valid required fields
 */
export const expectValidArtist = (artist) => {
  expectValidDocument(artist);
  expect(artist.name).toBeDefined();
  expect(typeof artist.name).toBe("string");
  expect(Array.isArray(artist.genres)).toBe(true);
};

/**
 * Assert that an album has valid required fields
 */
export const expectValidAlbum = (album) => {
  expectValidDocument(album);
  expect(album.title).toBeDefined();
  expect(album.artist).toBeDefined();
};

/**
 * Assert that a song has valid required fields
 */
export const expectValidSong = (song) => {
  expectValidDocument(song);
  expect(song.title).toBeDefined();
  expect(song.artist).toBeDefined();
  expect(typeof song.duration).toBe("number");
};

/**
 * Assert that a user has valid required fields (without password)
 */
export const expectValidUser = (user) => {
  expectValidDocument(user);
  expect(user.username).toBeDefined();
  expect(user.email).toBeDefined();
  expect(user.password).toBeUndefined(); // Should not expose password
};

/**
 * Assert that an error has expected status and message
 */
export const expectError = (error, statusCode, messagePattern) => {
  expect(error).toBeDefined();
  if (statusCode) {
    expect(error.statusCode).toBe(statusCode);
  }
  if (messagePattern) {
    expect(error.message).toMatch(messagePattern);
  }
};
