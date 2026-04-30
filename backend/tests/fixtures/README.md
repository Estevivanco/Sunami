# Test Fixtures

Static test data files.

## Files

- **artists.json** - Sample artist data for testing

## Usage

```javascript
import artistFixtures from "../fixtures/artists.json" assert { type: "json" };

// Use in tests
for (const artistData of artistFixtures) {
  await Artist.create(artistData);
}
```
