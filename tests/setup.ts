import "@testing-library/jest-dom/vitest";
import { beforeAll, afterAll, afterEach, vi } from "vitest";

const originalFetch = global.fetch;

// Setup test environment
beforeAll(() => {
  process.env.NODE_ENV = "test";
  // Leave DATABASE_URL undefined so server uses in-memory storage during tests
  delete process.env.DATABASE_URL;
});

afterEach(() => {
  vi.restoreAllMocks();
  if (originalFetch) {
    global.fetch = originalFetch;
  }
});

afterAll(() => {
  if (originalFetch) {
    global.fetch = originalFetch;
  }
});
