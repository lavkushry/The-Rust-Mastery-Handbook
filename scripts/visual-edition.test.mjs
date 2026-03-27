import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const scriptContent = readFileSync(path.join(projectRoot, "theme", "visual-edition.js"), "utf-8");

function renderWithVisualEdition(htmlContent) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <div id="mdbook-content">
          <main>
            ${htmlContent}
          </main>
        </div>
      </body>
    </html>
  `;
  const dom = new JSDOM(html, { runScripts: "dangerously" });

  const scriptEl = dom.window.document.createElement("script");
  scriptEl.textContent = scriptContent;
  dom.window.document.head.appendChild(scriptEl);

  const event = new dom.window.Event("DOMContentLoaded");
  dom.window.document.dispatchEvent(event);

  return dom.window.document;
}

test("visual-edition.js - page setup and concept color assignment", () => {
  const doc = renderWithVisualEdition(`
    <h1>Understanding Ownership</h1>
    <p>A long intro paragraph...</p>
  `);

  const main = doc.querySelector("main");
  assert.ok(main.classList.contains("visual-edition-page"));
  assert.strictEqual(main.dataset.concept, "ownership");
  assert.strictEqual(main.style.getPropertyValue("--chapter-accent"), "var(--ownership)");
});

test("visual-edition.js - default concept assignment", () => {
  const doc = renderWithVisualEdition(`
    <h1>Some Unknown Concept</h1>
  `);

  const main = doc.querySelector("main");
  assert.strictEqual(main.dataset.concept, "compiler");
  assert.strictEqual(main.style.getPropertyValue("--chapter-accent"), "var(--compiler)");
});

test("visual-edition.js - createHero - regular chapter", () => {
  const doc = renderWithVisualEdition(`
    <h1>Borrowing Basics</h1>
    <p>This paragraph is longer than 60 characters so it can be picked up as a hook by the hero section.</p>
  `);

  const hero = doc.querySelector(".chapter-hero");
  assert.ok(hero, "Hero section should be created");
  assert.strictEqual(hero.querySelector(".chapter-hero__title").textContent, "Borrowing Basics");
  assert.strictEqual(hero.querySelector(".chapter-hero__hook").textContent, "This paragraph is longer than 60 characters so it can be picked up as a hook by the hero section.");
});

test("visual-edition.js - createHero - part spread", () => {
  const doc = renderWithVisualEdition(`
    <h1>PART 2: Deep Dive</h1>
  `);

  const hero = doc.querySelector(".part-spread");
  assert.ok(hero, "Part spread section should be created");
  assert.strictEqual(hero.querySelector(".part-spread__title").textContent, "PART 2: Deep Dive");
});

test("visual-edition.js - upgradeCallouts", () => {
  const doc = renderWithVisualEdition(`
    <blockquote>
      <p>Expert Tip: Always prefer iterators.</p>
    </blockquote>
    <blockquote>
      <p>Common Mistake</p>
      <p>Forget to check bounds.</p>
    </blockquote>
    <blockquote>
      <p>Just a normal quote</p>
    </blockquote>
  `);

  const blockquotes = doc.querySelectorAll("blockquote");
  assert.strictEqual(blockquotes.length, 3);

  assert.ok(blockquotes[0].classList.contains("callout"));
  assert.ok(blockquotes[0].classList.contains("callout--expert-tip"));
  assert.strictEqual(blockquotes[0].querySelector(".callout__label").textContent, "⭐ Expert Tip: Always prefer iterators.");

  assert.ok(blockquotes[1].classList.contains("callout"));
  assert.ok(blockquotes[1].classList.contains("callout--common-mistake"));
  assert.strictEqual(blockquotes[1].querySelector(".callout__label").textContent, "⚠️ Common Mistake");

  assert.ok(!blockquotes[2].classList.contains("callout"));
});

test("visual-edition.js - cardifyRememberOnlyThree", () => {
  const doc = renderWithVisualEdition(`
    <h2>If you remember only 3 things</h2>
    <ul>
      <li>Thing 1</li>
      <li>Thing 2</li>
      <li>Thing 3</li>
    </ul>
    <h2>If you remember only 3 things</h2>
    <ul>
      <li>Not enough things</li>
    </ul>
  `);

  const rows = doc.querySelectorAll(".concept-card-row");
  assert.strictEqual(rows.length, 1);
  const cards = rows[0].querySelectorAll(".concept-card");
  assert.strictEqual(cards.length, 3);
  assert.strictEqual(cards[0].querySelector(".concept-card__num").textContent, "1");
  assert.strictEqual(cards[0].querySelector(".concept-card__text").textContent, "Thing 1");

  // The second list shouldn't be touched
  assert.strictEqual(doc.querySelectorAll("ul").length, 1);
});

test("visual-edition.js - enhanceMemoryHooks", () => {
  const doc = renderWithVisualEdition(`
    <h3>Memory Hook</h3>
    <p>Think of it like a library book.</p>
  `);

  const panel = doc.querySelector(".memory-hook-panel");
  assert.ok(panel);
  assert.ok(panel.querySelector(".memory-hook-panel__art"));
  assert.ok(panel.querySelector(".memory-hook-panel__body p"));
  assert.strictEqual(panel.querySelector(".memory-hook-panel__body p").textContent, "Think of it like a library book.");
});

test("visual-edition.js - enhanceFlashcardDecks", () => {
  const doc = renderWithVisualEdition(`
    <h2>Flashcard Deck</h2>
    <table>
      <tbody>
        <tr><td>Question 1</td><td>Answer 1</td></tr>
        <tr><td>Question 2</td><td>Answer 2</td></tr>
      </tbody>
    </table>
  `);

  const deck = doc.querySelector(".flashcard-grid");
  assert.ok(deck);
  const flashcards = deck.querySelectorAll(".flashcard");
  assert.strictEqual(flashcards.length, 2);

  assert.strictEqual(flashcards[0].querySelector(".flashcard__index").textContent, "Card 1");
  assert.strictEqual(flashcards[0].querySelector(".flashcard__question").textContent, "Question 1");
  assert.strictEqual(flashcards[0].querySelector(".flashcard__answer").textContent, "Answer 1");
});

test("visual-edition.js - enhanceCheatSheets", () => {
  const doc = renderWithVisualEdition(`
    <h2>Chapter Cheat Sheet</h2>
    <table>
      <tbody><tr><td>Data</td></tr></tbody>
    </table>
  `);

  const panel = doc.querySelector(".cheat-sheet-panel");
  assert.ok(panel);
  const table = panel.querySelector("table");
  assert.ok(table);
  assert.ok(table.classList.contains("visual-table"));
  assert.ok(table.classList.contains("cheat-sheet-table"));
});

test("visual-edition.js - styleTables", () => {
  const doc = renderWithVisualEdition(`
    <table><tbody><tr><td>Standard Table</td></tr></tbody></table>
  `);

  const table = doc.querySelector("table");
  assert.ok(table.classList.contains("visual-table"));

  // Table should be wrapped in a scrollable container
  const wrapper = table.parentElement;
  assert.ok(wrapper.classList.contains("visual-table-wrapper"), "Table should be wrapped in .visual-table-wrapper");
});

test("visual-edition.js - styleTables - idempotent wrapping", () => {
  // Verify that running styleTables twice does not double-wrap the table
  const doc = renderWithVisualEdition(`
    <table><tbody><tr><td>Standard Table</td></tr></tbody></table>
  `);

  const wrappers = doc.querySelectorAll(".visual-table-wrapper");
  assert.strictEqual(wrappers.length, 1, "Table should be wrapped exactly once");
});
