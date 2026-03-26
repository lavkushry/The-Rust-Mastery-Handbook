import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { escapeHtml } from "./utils.mjs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const toolNodeModules = path.join(projectRoot, ".pdf-tools", "node_modules");
const inputPath = path.join(projectRoot, "book", "print.html");
const cssPath = path.join(projectRoot, "styles", "pdf-export.css");
const bookTomlPath = path.join(projectRoot, "book.toml");

if (!existsSync(inputPath)) {
  console.error("Missing book/print.html. Run `mdbook build` first.");
  process.exit(1);
}

const args = process.argv.slice(2);
let format = "A4";
let outputPath;
let allFormats = false;

for (const arg of args) {
  if (arg === "--all-formats") {
    allFormats = true;
  } else if (arg.startsWith("--format=")) {
    const value = arg.slice("--format=".length).trim().toLowerCase();
    if (value === "a4") {
      format = "A4";
    } else if (value === "letter" || value === "us-letter" || value === "us_letter") {
      format = "Letter";
    } else {
      console.error(`Unsupported format: ${value}`);
      process.exit(1);
    }
  } else if (arg.startsWith("--output=")) {
    outputPath = path.resolve(arg.slice("--output=".length));
  } else if (!arg.startsWith("--") && !outputPath) {
    outputPath = path.resolve(arg);
  } else {
    console.error(`Unrecognized argument: ${arg}`);
    process.exit(1);
  }
}

if (allFormats && outputPath) {
  console.error("Use either `--all-formats` or a single explicit output path, not both.");
  process.exit(1);
}

const jobs = allFormats
  ? [
      {
        format: "A4",
        outputPath: path.join(projectRoot, "dist", "the-rust-mastery-handbook-a4.pdf"),
        editionLabel: "A4 Edition",
      },
      {
        format: "Letter",
        outputPath: path.join(projectRoot, "dist", "the-rust-mastery-handbook-letter.pdf"),
        editionLabel: "US Letter Edition",
      },
    ]
  : [
      {
        format,
        outputPath:
          outputPath ??
          path.join(
            projectRoot,
            "dist",
            format === "Letter"
              ? "the-rust-mastery-handbook-letter.pdf"
              : "the-rust-mastery-handbook.pdf",
          ),
        editionLabel: format === "Letter" ? "US Letter Edition" : "A4 Edition",
      },
    ];

const bookToml = existsSync(bookTomlPath)
  ? await readFile(bookTomlPath, "utf8")
  : "";
const customCss = existsSync(cssPath) ? await readFile(cssPath, "utf8") : "";

const bookTitleMatch = bookToml.match(/^title\s*=\s*"(.+)"$/m);
const descriptionMatch = bookToml.match(/^description\s*=\s*"(.+)"$/m);
const bookTitle = bookTitleMatch?.[1] ?? "The Rust Mastery Handbook";
const bookDescription =
  descriptionMatch?.[1] ??
  "A deep, first-principles systems handbook for Rust.";
const pageLoadTimeoutMs = 120_000;


let puppeteer;
let launchOptions;

if (existsSync(path.join(toolNodeModules, "@sparticuz", "chromium"))) {
  const chromium = require(path.join(toolNodeModules, "@sparticuz", "chromium"));
  puppeteer = require(path.join(toolNodeModules, "puppeteer-core"));
  launchOptions = {
    executablePath: await chromium.executablePath(),
    args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: chromium.defaultViewport,
    headless: chromium.headless,
  };
} else {
  puppeteer = require(path.join(toolNodeModules, "puppeteer"));
  launchOptions = {
    headless: "shell",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };
}

const browser = await puppeteer.launch(launchOptions);

try {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(pageLoadTimeoutMs);
  page.setDefaultTimeout(pageLoadTimeoutMs);
  await page.goto(pathToFileURL(inputPath).href, {
    waitUntil: "load",
    timeout: pageLoadTimeoutMs,
  });
  await page.waitForFunction(
    () => document.readyState === "complete",
    { timeout: pageLoadTimeoutMs },
  );
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 1500));
  await page.emulateMediaType("print");

  if (customCss) {
    await page.addStyleTag({ content: customCss });
  }

  await page.evaluate(
    ({ title, description }) => {
      document.body.classList.add("pdf-export");

      const main = document.querySelector("main");
      if (!main) {
        return;
      }

      for (const link of main.querySelectorAll("a.header")) {
        link.removeAttribute("href");
      }

      for (const heading of main.querySelectorAll("h1")) {
        const text = heading.textContent?.trim() ?? "";
        if (/^PART \d+/.test(text)) {
          heading.classList.add("pdf-part-title");
        }
        if (/^Chapter /.test(text)) {
          heading.classList.add("pdf-chapter-title");
        }
      }

      if (!main.querySelector(".pdf-cover")) {
        const visibleTitle = main.querySelector("h1")?.textContent?.trim() ?? title;
        const visibleSubtitle = main.querySelector("h2")?.textContent?.trim() ?? "";
        const cover = document.createElement("section");
        cover.className = "pdf-cover";
        cover.innerHTML = `
          <div class="pdf-cover__top">
            <div class="pdf-cover__eyebrow"></div>
            <div class="pdf-cover__spine"></div>
            <h1 class="pdf-cover__title">${visibleTitle}</h1>
            <p class="pdf-cover__subtitle">${visibleSubtitle}</p>
            <p class="pdf-cover__purpose">${description}</p>
          </div>
          <div class="pdf-cover__meta">
            <div>Rust handbook for serious systems engineers</div>
            <div>Generated from the mdBook source</div>
          </div>
        `;
        main.prepend(cover);
      }
    },
    {
      title: bookTitle,
      description: bookDescription,
    },
  );

  for (const job of jobs) {
    await mkdir(path.dirname(job.outputPath), { recursive: true });

    await page.evaluate(({ editionLabel }) => {
      const eyebrow = document.querySelector(".pdf-cover__eyebrow");
      if (eyebrow) {
        eyebrow.textContent = editionLabel;
      }
    }, {
      editionLabel: job.editionLabel,
    });

    const headerTemplate = `
      <div style="width:100%; padding:0 12mm; font-size:8px; color:#6b7280; text-transform:uppercase; letter-spacing:0.08em;">
        ${escapeHtml(job.editionLabel)}
      </div>
    `;

    const footerTemplate = `
      <div style="width:100%; padding:0 12mm; font-size:8px; color:#6b7280; display:flex; justify-content:space-between; align-items:center;">
        <span>${escapeHtml(bookTitle)}</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>
    `;

    await page.pdf({
      path: job.outputPath,
      format: job.format,
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: "18mm",
        right: "14mm",
        bottom: "18mm",
        left: "14mm",
      },
    });

    console.log(job.outputPath);
  }
  await page.close();
} finally {
  await browser.close();
}
