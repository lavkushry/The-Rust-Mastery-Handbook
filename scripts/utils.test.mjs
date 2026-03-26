import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "./utils.mjs";

test("escapeHtml - happy paths", () => {
  assert.strictEqual(escapeHtml("hello"), "hello");
  assert.strictEqual(escapeHtml("a & b"), "a &amp; b");
  assert.strictEqual(escapeHtml("<h1>Title</h1>"), "&lt;h1&gt;Title&lt;/h1&gt;");
  assert.strictEqual(escapeHtml('He said "Hello"'), "He said &quot;Hello&quot;");
  assert.strictEqual(escapeHtml("It's a me"), "It&#39;s a me");
});

test("escapeHtml - edge cases", () => {
  // Empty string
  assert.strictEqual(escapeHtml(""), "");

  // Multiple occurrences
  assert.strictEqual(escapeHtml("&&"), "&amp;&amp;");
  assert.strictEqual(escapeHtml("<<>>"), "&lt;&lt;&gt;&gt;");
  assert.strictEqual(escapeHtml('""'), "&quot;&quot;");
  assert.strictEqual(escapeHtml("''"), "&#39;&#39;");

  // String with only special characters
  assert.strictEqual(escapeHtml("&<>\"'"), "&amp;&lt;&gt;&quot;&#39;");

  // String with no special characters
  const plainString = "The quick brown fox jumps over the lazy dog 1234567890";
  assert.strictEqual(escapeHtml(plainString), plainString);
});

test("escapeHtml - ensures it handles all specified characters", () => {
  const input = "& < > \" '";
  const expected = "&amp; &lt; &gt; &quot; &#39;";
  assert.strictEqual(escapeHtml(input), expected);
});
