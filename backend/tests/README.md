# Test Suite

Comprehensive test suite for the Music App backend.

## Structure

```
tests/
├── unit/                    # Unit tests (fast, isolated)
│   ├── models/             # Model validation & logic
│   ├── repositories/       # Database operations
│   └── middleware/         # Middleware functions
├── integration/            # Integration tests (with dependencies)
│   ├── controllers/        # Controller logic with repos
│   └── routes/            # Full HTTP endpoint tests
├── fixtures/              # Static test data (JSON files)
├── helpers/               # Reusable test utilities
│   ├── testData.js        # Factory functions
│   └── assertions.js      # Custom assertions
└── setup/                 # Test environment setup
    ├── globalSetup.js     # Global test hooks
    └── setup.js           # Database helpers
```

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode (auto re-run on changes)
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run specific test type
npm run test:models
npm run test:repos
npm run test:controllers

# Run with coverage report
npm run test:coverage

# Run specific file
npm test artist.test.js
```

## Test Types

### Unit Tests (`tests/unit/`)

- **Fast** - No external dependencies
- **Isolated** - Test one component at a time
- **Focused** - Test business logic, validation, transforms
- **Examples**: Model validation, repository queries

### Integration Tests (`tests/integration/`)

- **Realistic** - Test with actual dependencies (in-memory DB)
- **End-to-end** - Test full request/response flow
- **Examples**: Controller operations, full API routes

## Writing Tests

### Using Test Helpers

```javascript
import { createArtistData } from "../helpers/testData.js";
import { expectValidArtist } from "../helpers/assertions.js";

it("should create artist", async () => {
  const data = createArtistData({ name: "Queen" });
  const artist = await Artist.create(data);

  expectValidArtist(artist);
  expect(artist.name).toBe("Queen");
});
```

### Using Fixtures

```javascript
import artistFixtures from "../fixtures/artists.json" assert { type: "json" };

beforeEach(async () => {
  for (const artistData of artistFixtures) {
    await Artist.create(artistData);
  }
});
```

## Best Practices

1. **Keep tests independent** - Each test should set up its own data
2. **Use descriptive names** - `it("should prevent duplicate artist names")`
3. **Test one thing** - One assertion per test when possible
4. **Use helpers** - Reuse test data factories and assertions
5. **Clean up** - Database is cleared between tests automatically

## Coverage Goals

- **Models**: 100% (critical business logic)
- **Repositories**: 95%+
- **Controllers**: 90%+
- **Overall**: 85%+
