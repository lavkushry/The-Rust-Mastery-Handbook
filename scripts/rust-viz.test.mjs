import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const scriptContent = readFileSync(path.join(projectRoot, "theme", "rust-viz.js"), "utf-8");

const SCENARIO = JSON.stringify({
  code: ["let s1 = String::from(\"hi\");", "let s2 = s1;", "println!(\"{s1}\");"],
  steps: [
    {
      line: 1,
      caption: "s1 owns the buffer.",
      stack: [{ frame: "main", vars: [{ name: "s1", value: "ptr", points: "h1", state: "owner" }] }],
      heap: [{ id: "h1", label: "String buffer", value: "\"hi\"", state: "alive" }],
    },
    {
      line: 2,
      caption: "Ownership moves to s2.",
      stack: [
        {
          frame: "main",
          vars: [
            { name: "s1", value: "ptr", state: "moved" },
            { name: "s2", value: "ptr", points: "h1", state: "owner" },
          ],
        },
      ],
      heap: [{ id: "h1", label: "String buffer", value: "\"hi\"", state: "alive" }],
    },
    {
      line: 3,
      caption: "Use after move is rejected.",
      note: { kind: "error", text: "error[E0382]: borrow of moved value: `s1`" },
      stack: [
        {
          frame: "main",
          vars: [
            { name: "s1", value: "ptr", state: "error" },
            { name: "s2", value: "ptr", points: "h1", state: "owner" },
          ],
        },
      ],
      heap: [{ id: "h1", label: "String buffer", value: "\"hi\"", state: "alive" }],
    },
  ],
});

function renderViz(innerHtml) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <div id="mdbook-content">
          <main>
            ${innerHtml}
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

function defaultWidget() {
  return `
    <div class="rust-viz" data-title="Move Semantics" data-eyebrow="Ownership Visualizer" data-accent="var(--move)">
    <script type="application/json">${SCENARIO}</script>
    <p class="rust-viz__fallback">Static fallback text.</p>
    </div>
  `;
}

test("rust-viz.js - initializes widget with title, code lines, and controls", () => {
  const doc = renderViz(defaultWidget());
  const viz = doc.querySelector(".rust-viz");

  assert.ok(viz.classList.contains("rust-viz--ready"));
  assert.strictEqual(viz.querySelector(".rust-viz__title").textContent, "Move Semantics");
  assert.strictEqual(viz.querySelector(".rust-viz__eyebrow").textContent, "Ownership Visualizer");
  assert.strictEqual(viz.querySelectorAll(".rust-viz__line").length, 3);
  assert.strictEqual(viz.querySelector(".rust-viz__counter").textContent, "1 / 3");
  assert.ok(viz.querySelector(".rust-viz__btn--next"));
  assert.strictEqual(viz.style.getPropertyValue("--viz-accent"), "var(--move)");
});

test("rust-viz.js - hides fallback paragraph once interactive", () => {
  const doc = renderViz(defaultWidget());
  assert.strictEqual(doc.querySelector(".rust-viz__fallback").hidden, true);
});

test("rust-viz.js - renders first step: highlighted line, stack frame, heap block", () => {
  const doc = renderViz(defaultWidget());
  const viz = doc.querySelector(".rust-viz");

  const lines = viz.querySelectorAll(".rust-viz__line");
  assert.ok(lines[0].classList.contains("rust-viz__line--active"));
  assert.ok(!lines[1].classList.contains("rust-viz__line--active"));

  assert.strictEqual(viz.querySelector(".rust-viz__frame-name").textContent, "main");
  assert.strictEqual(viz.querySelector(".rust-viz__var-name").textContent, "s1");
  assert.ok(viz.querySelector(".rust-viz__var--owner"));
  assert.strictEqual(viz.querySelector(".rust-viz__heap-value").textContent, '"hi"');
  assert.match(viz.querySelector(".rust-viz__caption").textContent, /Step 1 of 3/);
});

test("rust-viz.js - next button advances to move step", () => {
  const doc = renderViz(defaultWidget());
  const viz = doc.querySelector(".rust-viz");

  viz.querySelector(".rust-viz__btn--next").click();

  const lines = viz.querySelectorAll(".rust-viz__line");
  assert.ok(lines[1].classList.contains("rust-viz__line--active"));
  assert.strictEqual(viz.querySelector(".rust-viz__counter").textContent, "2 / 3");
  assert.ok(viz.querySelector(".rust-viz__var--moved"));
  assert.strictEqual(viz.querySelectorAll(".rust-viz__var").length, 2);
});

test("rust-viz.js - error step shows compiler note and error styling", () => {
  const doc = renderViz(defaultWidget());
  const viz = doc.querySelector(".rust-viz");
  const next = viz.querySelector(".rust-viz__btn--next");

  next.click();
  next.click();

  const note = viz.querySelector(".rust-viz__note");
  assert.strictEqual(note.hidden, false);
  assert.ok(note.classList.contains("rust-viz__note--error"));
  assert.match(note.textContent, /E0382/);
  assert.ok(viz.querySelector(".rust-viz__var--error"));
  assert.ok(viz.querySelectorAll(".rust-viz__line")[2].classList.contains("rust-viz__line--error"));
  assert.strictEqual(next.disabled, true);
});

test("rust-viz.js - prev and reset move backwards and clear the note", () => {
  const doc = renderViz(defaultWidget());
  const viz = doc.querySelector(".rust-viz");
  const next = viz.querySelector(".rust-viz__btn--next");

  next.click();
  next.click();
  viz.querySelectorAll(".rust-viz__btn")[1].click(); // Prev
  assert.strictEqual(viz.querySelector(".rust-viz__counter").textContent, "2 / 3");

  viz.querySelectorAll(".rust-viz__btn")[0].click(); // Reset
  assert.strictEqual(viz.querySelector(".rust-viz__counter").textContent, "1 / 3");
  assert.strictEqual(viz.querySelector(".rust-viz__note").hidden, true);
  assert.strictEqual(viz.querySelectorAll(".rust-viz__btn")[1].disabled, true);
});

test("rust-viz.js - arrow keys step through the simulation", () => {
  const doc = renderViz(defaultWidget());
  const viz = doc.querySelector(".rust-viz");
  const win = doc.defaultView;

  viz.dispatchEvent(new win.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  assert.strictEqual(viz.querySelector(".rust-viz__counter").textContent, "2 / 3");

  viz.dispatchEvent(new win.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
  assert.strictEqual(viz.querySelector(".rust-viz__counter").textContent, "1 / 3");
});

test("rust-viz.js - ignores containers with malformed or missing JSON", () => {
  const doc = renderViz(`
    <div class="rust-viz" data-title="Broken">
    <script type="application/json">{ not json }</script>
    </div>
    <div class="rust-viz" data-title="Empty"></div>
  `);

  doc.querySelectorAll(".rust-viz").forEach((viz) => {
    assert.ok(!viz.classList.contains("rust-viz--ready"));
    assert.strictEqual(viz.querySelector(".rust-viz__controls"), null);
  });
});

test("rust-viz.js - caption region is an aria-live announcer", () => {
  const doc = renderViz(defaultWidget());
  const caption = doc.querySelector(".rust-viz__caption");
  assert.strictEqual(caption.getAttribute("aria-live"), "polite");
  assert.strictEqual(caption.getAttribute("aria-atomic"), "true");
});

test("chapters - every embedded rust-viz scenario parses and references valid targets", () => {
  const srcDir = path.join(projectRoot, "src");
  const chapterFiles = [];
  const walk = (dir) => {
    readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".md")) {
        chapterFiles.push(full);
      }
    });
  };
  walk(srcDir);

  let scenarioCount = 0;
  chapterFiles.forEach((file) => {
    const content = readFileSync(file, "utf-8");
    const blocks = content.match(/<div class="rust-viz"[\s\S]*?<\/div>/g) || [];
    blocks.forEach((block) => {
      const jsonMatch = block.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
      assert.ok(jsonMatch, `rust-viz block without JSON scenario in ${file}`);
      const scenario = JSON.parse(jsonMatch[1]);
      scenarioCount += 1;

      assert.ok(Array.isArray(scenario.code) && scenario.code.length > 0, `empty code in ${file}`);
      assert.ok(Array.isArray(scenario.steps) && scenario.steps.length > 0, `empty steps in ${file}`);

      scenario.steps.forEach((step, i) => {
        assert.ok(
          step.line >= 1 && step.line <= scenario.code.length,
          `step ${i + 1} in ${file} highlights line ${step.line}, but code has ${scenario.code.length} lines`,
        );
        assert.ok(step.caption, `step ${i + 1} in ${file} is missing a caption`);

        const targets = new Set();
        (step.heap || []).forEach((block_) => block_.id && targets.add(block_.id));
        (step.stack || []).forEach((frame) =>
          (frame.vars || []).forEach((v) => v.id && targets.add(v.id)),
        );
        (step.stack || []).forEach((frame) =>
          (frame.vars || []).forEach((v) => {
            if (v.points) {
              assert.ok(
                targets.has(v.points),
                `step ${i + 1} in ${file}: ${v.name} points at unknown target "${v.points}"`,
              );
            }
          }),
        );
      });

      assert.match(block, /rust-viz__fallback/, `rust-viz block in ${file} is missing a no-JS fallback`);
    });
  });

  assert.ok(scenarioCount >= 40, `expected at least 40 embedded scenarios, found ${scenarioCount}`);
});
