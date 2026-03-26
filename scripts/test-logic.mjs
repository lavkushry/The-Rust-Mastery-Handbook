
import { readFile } from "node:fs/promises";
import assert from "node:assert";

async function testExtraction() {
  console.log("Running logic verification tests...");

  // Mocking book.toml content
  const mockBookToml = `
title = "The Rust Mastery Handbook - Test"
description = "A test description for the Rust handbook."
  `;

  const bookTitleMatch = mockBookToml.match(/^title\s*=\s*"(.+)"$/m);
  const descriptionMatch = mockBookToml.match(/^description\s*=\s*"(.+)"$/m);

  const bookTitle = bookTitleMatch?.[1] ?? "The Rust Mastery Handbook";
  const bookDescription = descriptionMatch?.[1] ?? "A deep, first-principles systems handbook for Rust.";

  assert.strictEqual(bookTitle, "The Rust Mastery Handbook - Test");
  assert.strictEqual(bookDescription, "A test description for the Rust handbook.");
  console.log("✅ Regex extraction for title and description works correctly.");

  // Test with empty/failed read
  const emptyBookToml = "";
  const bookTitleMatchEmpty = emptyBookToml.match(/^title\s*=\s*"(.+)"$/m);
  const descriptionMatchEmpty = emptyBookToml.match(/^description\s*=\s*"(.+)"$/m);

  const bookTitleEmpty = bookTitleMatchEmpty?.[1] ?? "The Rust Mastery Handbook";
  const bookDescriptionEmpty = descriptionMatchEmpty?.[1] ?? "A deep, first-principles systems handbook for Rust.";

  assert.strictEqual(bookTitleEmpty, "The Rust Mastery Handbook");
  assert.strictEqual(bookDescriptionEmpty, "A deep, first-principles systems handbook for Rust.");
  console.log("✅ Fallback values for empty content work correctly.");
}

testExtraction().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
