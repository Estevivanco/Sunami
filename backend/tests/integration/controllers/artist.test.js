import { describe, it, expect, beforeEach } from "vitest";
import Artist from "../../../models/Artist.js";
import Album from "../../../models/Album.js";
import Song from "../../../models/Song.js";
import artistRepository from "../../../repositories/artistRepository.js";

describe("Artist Controller Integration", () => {
  describe("Artist Operations", () => {
    it("should create and retrieve an artist", async () => {
      const artistData = { name: "Radiohead", country: "UK" };
      const created = await artistRepository.create(artistData);

      expect(created.name).toBe("Radiohead");
      expect(created.country).toBe("UK");

      const found = await artistRepository.findById(created._id);
      expect(found.name).toBe("Radiohead");
    });

    it("should get all artists", async () => {
      await Artist.create({ name: "Radiohead" });
      await Artist.create({ name: "Coldplay" });

      const artists = await artistRepository.findAll();
      expect(artists).toHaveLength(2);
    });

    it("should update an artist", async () => {
      const artist = await Artist.create({ name: "Queen" });
      
      const updated = await artistRepository.update(artist._id, {
        bio: "Legendary British rock band",
        verified: true
      });

      expect(updated.bio).toBe("Legendary British rock band");
      expect(updated.verified).toBe(true);
    });

    it("should delete an artist", async () => {
      const artist = await Artist.create({ name: "Nirvana" });
      
      const deleted = await artistRepository.delete(artist._id);
      expect(deleted).toBeDefined();

      const found = await Artist.findById(artist._id);
      expect(found).toBeNull();
    });
  });

  describe("Artist Validation", () => {
    it("should prevent duplicate artist names", async () => {
      await Artist.create({ name: "Metallica" });

      await expect(
        Artist.create({ name: "Metallica" })
      ).rejects.toThrow('Artist with name "Metallica" already exists');
    });

    it("should require artist name", async () => {
      await expect(Artist.create({})).rejects.toThrow();
    });
  });

  describe("Artist Relationships", () => {
    it("should prevent deletion if artist has albums", async () => {
      const artist = await Artist.create({ name: "Pink Floyd" });
      
      await Album.create({
        title: "The Dark Side of the Moon",
        artist: artist._id
      });

      await expect(
        Artist.findByIdAndDelete(artist._id)
      ).rejects.toThrow(/Cannot delete artist/);
    });

    it("should find artists by genre", async () => {
      await Artist.create({ name: "The Strokes", genres: ["Rock", "Indie"] });
      await Artist.create({ name: "Arctic Monkeys", genres: ["Rock"] });
      await Artist.create({ name: "Taylor Swift", genres: ["Pop"] });

      const rockArtists = await artistRepository.findByGenre("Rock");
      expect(rockArtists).toHaveLength(2);
    });

    it("should find artists by country", async () => {
      await Artist.create({ name: "ABBA", country: "Sweden" });
      await Artist.create({ name: "Roxette", country: "Sweden" });
      await Artist.create({ name: "Adele", country: "UK" });

      const swedishArtists = await artistRepository.findByCountry("Sweden");
      expect(swedishArtists).toHaveLength(2);
    });
  });

  describe("Artist Search", () => {
    it("should find artist by exact name", async () => {
      await Artist.create({ name: "The Beatles" });
      
      const found = await artistRepository.findByName("The Beatles");
      expect(found).toBeDefined();
      expect(found.name).toBe("The Beatles");
    });

    it("should return null for non-existent artist", async () => {
      const found = await artistRepository.findByName("Non Existent Band");
      expect(found).toBeNull();
    });
  });
});
