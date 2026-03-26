
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const bookTomlPath = path.join(projectRoot, "book.toml");
const cssPath = path.join(projectRoot, "styles", "pdf-export.css");

async function original() {
  const bookToml = existsSync(bookTomlPath)
    ? await readFile(bookTomlPath, "utf8")
    : "";
  const customCss = existsSync(cssPath) ? await readFile(cssPath, "utf8") : "";
  return { bookToml, customCss };
}

async function optimized() {
  const bookToml = await readFile(bookTomlPath, "utf8").catch(() => "");
  const customCss = await readFile(cssPath, "utf8").catch(() => "");
  return { bookToml, customCss };
}

async function benchmark(name, fn, iterations = 1000) {
  // Warmup
  for (let i = 0; i < 100; i++) await fn();

  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    await fn();
  }
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1_000_000; // ms
  console.log(`${name}: ${duration.toFixed(4)} ms total for ${iterations} iterations (${(duration / iterations).toFixed(4)} ms/op)`);
  return duration;
}

async function run() {
  console.log("Starting benchmark...");
  const iterations = 10000;
  const t1 = await benchmark("Original (existsSync + readFile)", original, iterations);
  const t2 = await benchmark("Optimized (readFile + catch)", optimized, iterations);

  const diff = t1 - t2;
  const percent = (diff / t1) * 100;
  console.log(`Improvement: ${diff.toFixed(4)} ms (${percent.toFixed(2)}%)`);
}

run().catch(console.error);
