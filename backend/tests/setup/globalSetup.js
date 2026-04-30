import { beforeAll, afterAll, beforeEach } from "vitest";
import { connectTestDb, closeTestDb, clearDb } from "./setup.js";

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await closeTestDb();
});

beforeEach(async () => {
  await clearDb();
});
