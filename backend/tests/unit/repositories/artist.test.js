import { describe, it, expect, beforeEach } from "vitest";
import artistRepository from "../../../repositories/artistRepository.js";
import Artist from "../../../models/Artist.js";
import Album from "../../../models/Album.js"; // Import to register the model

describe("Artist Repository", () => {
  describe("findAll", () => {
    it("should return all artists", async () => {
      await Artist.create({ name: "Radiohead" });
      await Artist.create({ name: "Coldplay" });
      await Artist.create({ name: "Muse" });

      const artists = await artistRepository.findAll();

      expect(artists).toHaveLength(3);
      expect(artists[0].name).toBe("Radiohead");
      expect(artists[1].name).toBe("Coldplay");
      expect(artists[2].name).toBe("Muse");
    });

    it("should return empty array when no artists exist", async () => {
      const artists = await artistRepository.findAll();
      expect(artists).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should find artist by valid ID", async () => {
      const created = await Artist.create({ name: "The Beatles" });
      const found = await artistRepository.findById(created._id);

      expect(found).toBeDefined();
      expect(found.name).toBe("The Beatles");
      expect(found._id.toString()).toBe(created._id.toString());
    });

    it("should return null for non-existent ID", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const found = await artistRepository.findById(fakeId);
      expect(found).toBeNull();
    });

    it("should return null for invalid ID format", async () => {
      const found = await artistRepository.findById("invalid-id");
      expect(found).toBeNull();
    });
  });

  describe("findByName", () => {
    it("should find artist by exact name", async () => {
      await Artist.create({ name: "Pink Floyd" });
      const found = await artistRepository.findByName("Pink Floyd");

      expect(found).toBeDefined();
      expect(found.name).toBe("Pink Floyd");
    });

    it("should return null for non-existent name", async () => {
      const found = await artistRepository.findByName("Non Existent Artist");
      expect(found).toBeNull();
    });

    it("should be case-sensitive", async () => {
      await Artist.create({ name: "Queen" });
      const found = await artistRepository.findByName("queen");
      
      expect(found).toBeNull();
    });
  });

  describe("create", () => {
    it("should create new artist with minimal data", async () => {
      const artistData = { name: "Nirvana" };
      const artist = await artistRepository.create(artistData);

      expect(artist).toBeDefined();
      expect(artist.name).toBe("Nirvana");
      expect(artist._id).toBeDefined();
    });

    it("should create artist with all fields", async () => {
      const artistData = {
        name: "Led Zeppelin",
        genres: ["Rock", "Blues"],
        country: "UK",
        image: "https://example.com/ledzeppelin.jpg",
        bio: "Legendary rock band",
        verified: true,
        monthlyListeners: 2000000,
        followers: 1500000
      };

      const artist = await artistRepository.create(artistData);

      expect(artist.name).toBe("Led Zeppelin");
      expect(artist.genres).toEqual(["Rock", "Blues"]);
      expect(artist.country).toBe("UK");
      expect(artist.image).toBe("https://example.com/ledzeppelin.jpg");
      expect(artist.bio).toBe("Legendary rock band");
      expect(artist.verified).toBe(true);
      expect(artist.monthlyListeners).toBe(2000000);
      expect(artist.followers).toBe(1500000);
    });

    it("should throw error when name is missing", async () => {
      await expect(artistRepository.create({})).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update artist with new data", async () => {
      const artist = await Artist.create({ name: "AC/DC" });
      
      const updated = await artistRepository.update(artist._id, {
        bio: "Australian rock band",
        verified: true
      });

      expect(updated.bio).toBe("Australian rock band");
      expect(updated.verified).toBe(true);
    });

    it("should return null for non-existent ID", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const updated = await artistRepository.update(fakeId, { bio: "Updated" });
      
      expect(updated).toBeNull();
    });

    it("should validate updated data", async () => {
      const artist = await Artist.create({ name: "Metallica" });

      await expect(
        artistRepository.update(artist._id, { name: "" })
      ).rejects.toThrow();
    });

    it("should update multiple fields at once", async () => {
      const artist = await Artist.create({ name: "U2" });
      
      const updated = await artistRepository.update(artist._id, {
        country: "Ireland",
        genres: ["Rock", "Alternative"],
        monthlyListeners: 5000000
      });

      expect(updated.country).toBe("Ireland");
      expect(updated.genres).toEqual(["Rock", "Alternative"]);
      expect(updated.monthlyListeners).toBe(5000000);
    });
  });

  describe("delete", () => {
    it("should delete artist by ID", async () => {
      const artist = await Artist.create({ name: "Oasis" });
      const deleted = await artistRepository.delete(artist._id);

      expect(deleted).toBeDefined();
      expect(deleted._id.toString()).toBe(artist._id.toString());

      const found = await Artist.findById(artist._id);
      expect(found).toBeNull();
    });

    it("should return null when deleting non-existent artist", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const deleted = await artistRepository.delete(fakeId);
      
      expect(deleted).toBeNull();
    });
  });

  describe("findByGenre", () => {
    beforeEach(async () => {
      await Artist.create({ name: "The Strokes", genres: ["Rock", "Indie"] });
      await Artist.create({ name: "Arctic Monkeys", genres: ["Rock", "Alternative"] });
      await Artist.create({ name: "Taylor Swift", genres: ["Pop", "Country"] });
    });

    it("should find all artists by genre", async () => {
      const rockArtists = await artistRepository.findByGenre("Rock");

      expect(rockArtists).toHaveLength(2);
      expect(rockArtists.map(a => a.name)).toContain("The Strokes");
      expect(rockArtists.map(a => a.name)).toContain("Arctic Monkeys");
    });

    it("should return empty array for non-existent genre", async () => {
      const artists = await artistRepository.findByGenre("Jazz");
      expect(artists).toEqual([]);
    });

    it("should be case-sensitive for genre", async () => {
      const artists = await artistRepository.findByGenre("rock");
      expect(artists).toEqual([]);
    });
  });

  describe("findByCountry", () => {
    beforeEach(async () => {
      await Artist.create({ name: "ABBA", country: "Sweden" });
      await Artist.create({ name: "Roxette", country: "Sweden" });
      await Artist.create({ name: "Adele", country: "UK" });
    });

    it("should find all artists by country", async () => {
      const swedishArtists = await artistRepository.findByCountry("Sweden");

      expect(swedishArtists).toHaveLength(2);
      expect(swedishArtists.map(a => a.name)).toContain("ABBA");
      expect(swedishArtists.map(a => a.name)).toContain("Roxette");
    });

    it("should return empty array for non-existent country", async () => {
      const artists = await artistRepository.findByCountry("Norway");
      expect(artists).toEqual([]);
    });
  });
});
