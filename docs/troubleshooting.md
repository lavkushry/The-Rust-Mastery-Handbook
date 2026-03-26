# Troubleshooting

For quick setup guidance first, see docs/getting-started.md and docs/installation.md.

## mdbook command not found

Symptom:

- Running mdbook build fails because mdbook is missing.

Fix:

```bash
cargo install mdbook --locked
```

Verify:

```bash
mdbook --version
```

## Build fails after SUMMARY edits

Symptom:

- mdbook build reports missing files or navigation errors.

Fix:

- Ensure every entry in src/SUMMARY.md points to an existing file.
- Ensure moved or renamed files are updated in links.
- Run mdbook build again after corrections.

## Broken internal links in rendered pages

Symptom:

- Links resolve in Markdown but break in generated HTML.

Fix:

- Use relative paths aligned with mdBook page locations.
- Verify target files are present under src/.
- Preview with mdbook serve and click through changed links.

## GitHub Pages workflow fails at Setup Pages

Symptom:

- deploy-pages.yml fails at the Setup Pages step.

Cause:

- Repository Pages source is not configured to GitHub Actions.

Fix (GitHub UI):

1. Go to Settings > Pages
2. Set Build and deployment source to GitHub Actions
3. Re-run the workflow

## PDF export fails with module errors

Symptom:

- scripts/export-pdf.mjs fails to require Puppeteer modules.

Cause:

- Optional local PDF tool dependencies are missing under .pdf-tools/node_modules.

Fix:

- Install the expected Node dependencies in a local .pdf-tools environment.
- Re-run mdbook build before export.

## PDF export fails because print.html is missing

Symptom:

- Script says Missing book/print.html.

Fix:

```bash
mdbook build
node scripts/export-pdf.mjs
```

## Changes are not visible in local preview

Symptom:

- Browser still shows older content.

Fix:

- Hard refresh browser tab.
- Restart mdbook serve.
- Ensure you edited files under src/ and not generated output under book/.

## CI passes locally but fails on GitHub

Checklist:

- Confirm mdBook version compatibility.
- Confirm no local-only files are required.
- Confirm links and paths are case-correct for Linux runners.

## Need Help Choosing the Right Channel

- Usage/support question: .github/SUPPORT.md
- Reproducible repository defect: bug issue template
- Security concern: SECURITY.md
