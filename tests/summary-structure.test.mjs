import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");
const summaryPath = path.join(srcRoot, "SUMMARY.md");

function normalizeSlug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_\[\]{}()#+.!?,:;"\\/]/g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractHeadings(markdown) {
  const headings = new Set();
  const headingRegex = /^(#{1,6})\s+(.*)$/gm;
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const headingText = match[2].replace(/\s*\{#.*\}\s*$/, "").trim();
    headings.add(normalizeSlug(headingText));
  }
  return headings;
}

function parseSummaryLinks(summaryMarkdown) {
  const links = [];
  const lineRegex = /\[[^\]]+\]\(([^)]+\.md)\)/g;
  let match;
  while ((match = lineRegex.exec(summaryMarkdown)) !== null) {
    links.push(match[1]);
  }
  return links;
}

function parseMarkdownLinks(markdown) {
  const links = [];
  const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(markdown)) !== null) {
    links.push(match[1].trim());
  }
  return links;
}

test("SUMMARY.md references files that exist and have an H1", () => {
  const summaryMarkdown = readFileSync(summaryPath, "utf8");
  const links = parseSummaryLinks(summaryMarkdown);

  assert.ok(links.length > 0, "SUMMARY.md should include markdown links");

  for (const relPath of links) {
    const absolutePath = path.join(srcRoot, relPath);
    const contents = readFileSync(absolutePath, "utf8");

    assert.ok(contents.trim().length > 0, `File should not be empty: ${relPath}`);
    assert.match(contents, /^#\s+.+/m, `File should contain an H1: ${relPath}`);
  }
});

test("chapter numbering in SUMMARY.md remains sequential", () => {
  const summaryMarkdown = readFileSync(summaryPath, "utf8");
  const chapterRegex = /Chapter\s+(\d+)([A-Z]?)/g;
  const chapterNumbers = [];
  let match;

  while ((match = chapterRegex.exec(summaryMarkdown)) !== null) {
    chapterNumbers.push({ number: Number(match[1]), suffix: match[2] });
  }

  assert.ok(chapterNumbers.length > 0, "Expected chapter entries in SUMMARY.md");

  const numericSet = new Set(chapterNumbers.map((entry) => entry.number));
  const min = Math.min(...numericSet);
  const max = Math.max(...numericSet);

  for (let n = min; n <= max; n += 1) {
    assert.ok(numericSet.has(n), `Missing chapter number in SUMMARY.md: ${n}`);
  }
});

test("internal markdown links and anchors resolve for handbook source files", () => {
  const summaryMarkdown = readFileSync(summaryPath, "utf8");
  const summaryLinks = parseSummaryLinks(summaryMarkdown);
  const filesToCheck = ["README.md", ...summaryLinks.map((entry) => path.join("src", entry))];

  const headingsByPath = new Map();
  for (const relPath of filesToCheck) {
    const absolutePath = path.join(projectRoot, relPath);
    const markdown = readFileSync(absolutePath, "utf8");
    headingsByPath.set(relPath, extractHeadings(markdown));
  }

  for (const relPath of filesToCheck) {
    const absolutePath = path.join(projectRoot, relPath);
    const markdown = readFileSync(absolutePath, "utf8");
    const fileDir = path.dirname(absolutePath);

    for (const href of parseMarkdownLinks(markdown)) {
      if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
        continue;
      }

      if (href.startsWith("#")) {
        const anchor = normalizeSlug(href.slice(1));
        const localHeadings = headingsByPath.get(relPath) ?? new Set();
        assert.ok(localHeadings.has(anchor), `Unresolved local anchor in ${relPath}: ${href}`);
        continue;
      }

      const [targetPathRaw, anchorRaw] = href.split("#");
      if (!targetPathRaw) {
        continue;
      }

      const targetAbsolute = path.resolve(fileDir, targetPathRaw);
      const targetRelative = path.relative(projectRoot, targetAbsolute);
      const targetMarkdown = readFileSync(targetAbsolute, "utf8");
      assert.ok(targetMarkdown.length >= 0, `Missing target file for link in ${relPath}: ${href}`);

      if (anchorRaw) {
        const targetHeadings = headingsByPath.get(targetRelative) ?? extractHeadings(targetMarkdown);
        headingsByPath.set(targetRelative, targetHeadings);
        const anchor = normalizeSlug(anchorRaw);
        assert.ok(targetHeadings.has(anchor), `Unresolved anchor in ${relPath}: ${href}`);
      }
    }
  }
});
