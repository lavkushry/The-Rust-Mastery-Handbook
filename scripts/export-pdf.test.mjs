import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rm, mkdir, writeFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const scriptPath = path.join(__dirname, "export-pdf.mjs");
const printHtmlDir = path.join(projectRoot, "book");
const printHtmlPath = path.join(printHtmlDir, "print.html");

describe("export-pdf.mjs", () => {
  const backupPath = printHtmlPath + ".bak";

  before(async () => {
    if (existsSync(printHtmlPath)) {
      await rm(backupPath, { force: true });
      await rename(printHtmlPath, backupPath);
    }
  });

  after(async () => {
    if (existsSync(printHtmlPath)) {
      await rm(printHtmlPath, { force: true });
    }
    if (existsSync(backupPath)) {
      await rename(backupPath, printHtmlPath);
    }
  });

  test("fails when book/print.html is missing", async () => {
    if (existsSync(printHtmlPath)) {
      await rm(printHtmlPath, { force: true });
    }

    await assert.rejects(
      execFileAsync("node", [scriptPath]),
      (err) => {
        assert.strictEqual(err.code, 1);
        assert.match(err.stderr, /Missing book\/print\.html\. Run `mdbook build` first\./);
        return true;
      }
    );
  });

  test("fails with unsupported format", async () => {
    await mkdir(printHtmlDir, { recursive: true });
    await writeFile(printHtmlPath, "<html><body>Dummy</body></html>", "utf8");

    await assert.rejects(
      execFileAsync("node", [scriptPath, "--format=invalid-format"]),
      (err) => {
        assert.strictEqual(err.code, 1);
        assert.match(err.stderr, /Unsupported format: invalid-format/);
        return true;
      }
    );
  });

  test("fails with unrecognized argument", async () => {
    await mkdir(printHtmlDir, { recursive: true });
    await writeFile(printHtmlPath, "<html><body>Dummy</body></html>", "utf8");

    await assert.rejects(
      execFileAsync("node", [scriptPath, "--unknown-flag"]),
      (err) => {
        assert.strictEqual(err.code, 1);
        assert.match(err.stderr, /Unrecognized argument: --unknown-flag/);
        return true;
      }
    );
  });

  test("fails when both --all-formats and explicit output path are provided", async () => {
    await mkdir(printHtmlDir, { recursive: true });
    await writeFile(printHtmlPath, "<html><body>Dummy</body></html>", "utf8");

    await assert.rejects(
      execFileAsync("node", [scriptPath, "--all-formats", "--output=foo.pdf"]),
      (err) => {
        assert.strictEqual(err.code, 1);
        assert.match(err.stderr, /Use either `--all-formats` or a single explicit output path, not both\./);
        return true;
      }
    );
  });

  test("fails when both --all-formats and positional output path are provided", async () => {
    await mkdir(printHtmlDir, { recursive: true });
    await writeFile(printHtmlPath, "<html><body>Dummy</body></html>", "utf8");

    await assert.rejects(
      execFileAsync("node", [scriptPath, "--all-formats", "foo.pdf"]),
      (err) => {
        assert.strictEqual(err.code, 1);
        assert.match(err.stderr, /Use either `--all-formats` or a single explicit output path, not both\./);
        return true;
      }
    );
  });
});
