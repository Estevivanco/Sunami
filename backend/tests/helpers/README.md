# Test Helpers

Reusable utilities for testing.

## Files

- **testData.js** - Factory functions for creating test data
- **assertions.js** - Custom assertion helpers

## Usage

```javascript
import { createArtistData } from "../helpers/testData.js";
import { expectValidArtist } from "../helpers/assertions.js";

// Create test data
const artistData = createArtistData({ name: "Queen" });
const artist = await Artist.create(artistData);

// Validate
expectValidArtist(artist);
```
