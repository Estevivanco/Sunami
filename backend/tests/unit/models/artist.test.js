import { describe, it, expect, beforeEach } from "vitest";
import Artist from "../../../models/Artist.js";
import Album from "../../../models/Album.js"; // Import to register the model
import mongoose from "mongoose";

describe("Artist Model", () => {
  describe("Validation", () => {
    it("should require name", async () => {
      const artist = new Artist({});
      await expect(artist.save()).rejects.toThrow();
    });

    it("should trim name automatically", async () => {
      const artist = await Artist.create({ name: "  Radiohead  " });
      expect(artist.name).toBe("Radiohead");
    });

    it("should capitalize first letter of name", async () => {
      const artist = await Artist.create({ name: "radiohead" });
      expect(artist.name).toBe("Radiohead");
    });

    it("should trim whitespace from fields", async () => {
      const artist = await Artist.create({
        name: "  The Beatles  ",
        country: "  UK  ",
        bio: "  Great band  "
      });

      expect(artist.name).toBe("The Beatles");
      expect(artist.country).toBe("UK");
      expect(artist.bio).toBe("Great band");
    });
  });

  describe("Default Values", () => {
    it("should set default values for optional fields", async () => {
      const artist = await Artist.create({ name: "Pink Floyd" });

      expect(artist.genres).toEqual([]);
      expect(artist.bio).toBe("");
      expect(artist.verified).toBe(false);
      expect(artist.monthlyListeners).toBe(0);
      expect(artist.followers).toBe(0);
    });

    it("should accept custom values for optional fields", async () => {
      const artist = await Artist.create({
        name: "Led Zeppelin",
        genres: ["Rock", "Blues"],
        country: "UK",
        bio: "Legendary rock band",
        verified: true,
        monthlyListeners: 1000000,
        followers: 500000
      });

      expect(artist.genres).toEqual(["Rock", "Blues"]);
      expect(artist.country).toBe("UK");
      expect(artist.bio).toBe("Legendary rock band");
      expect(artist.verified).toBe(true);
      expect(artist.monthlyListeners).toBe(1000000);
      expect(artist.followers).toBe(500000);
    });
  });

  describe("Timestamps", () => {
    it("should have createdAt and updatedAt timestamps", async () => {
      const artist = await Artist.create({ name: "Queen" });

      expect(artist.createdAt).toBeDefined();
      expect(artist.updatedAt).toBeDefined();
      expect(artist.createdAt).toBeInstanceOf(Date);
      expect(artist.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt when modified", async () => {
      const artist = await Artist.create({ name: "AC/DC" });
      const originalUpdatedAt = artist.updatedAt;

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      artist.bio = "Updated bio";
      await artist.save();

      expect(artist.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe("Duplicate Prevention", () => {
    it("should prevent creating artists with duplicate names", async () => {
      await Artist.create({ name: "Metallica" });

      await expect(
        Artist.create({ name: "Metallica" })
      ).rejects.toThrow('Artist with name "Metallica" already exists');
    });

    it("should handle case sensitivity in name (capitalization)", async () => {
      await Artist.create({ name: "metallica" });

      // Due to capitalization hook, both will become "Metallica"
      await expect(
        Artist.create({ name: "Metallica" })
      ).rejects.toThrow('Artist with name "Metallica" already exists');
    });
  });

  describe("Album Deletion Prevention", () => {
    it("should prevent deletion if artist has albums", async () => {
      const artist = await Artist.create({ name: "Nirvana" });

      // Create Album model if not exists
      const Album = mongoose.models.Album || mongoose.model('Album', new mongoose.Schema({
        title: String,
        artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }
      }));

      await Album.create({
        title: "Nevermind",
        artist: artist._id
      });

      await expect(
        Artist.findByIdAndDelete(artist._id)
      ).rejects.toThrow(/Cannot delete artist/);
    });
  });

  describe("Data Types", () => {
    it("should accept array of genres", async () => {
      const artist = await Artist.create({
        name: "David Bowie",
        genres: ["Rock", "Pop", "Glam Rock"]
      });

      expect(Array.isArray(artist.genres)).toBe(true);
      expect(artist.genres).toHaveLength(3);
    });

    it("should accept numeric values for listeners and followers", async () => {
      const artist = await Artist.create({
        name: "Taylor Swift",
        monthlyListeners: 50000000,
        followers: 30000000
      });

      expect(typeof artist.monthlyListeners).toBe("number");
      expect(typeof artist.followers).toBe("number");
    });

    it("should accept image URL", async () => {
      const artist = await Artist.create({
        name: "Drake",
        image: "https://example.com/drake.jpg"
      });

      expect(artist.image).toBe("https://example.com/drake.jpg");
    });
  });
});
