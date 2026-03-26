# Configuration

Core project configuration is in book.toml.

## book.toml Sections

- [book]
  - title, authors, language, source path, description
- [build]
  - output directory and file generation controls
- [output.html]
  - themes, punctuation behavior, section labels
  - additional CSS and JS assets
  - repository and edit-link metadata

## Content Navigation

Navigation is controlled by src/SUMMARY.md.

Rules:

- every listed page must exist
- links should remain relative to src/
- structural changes should be reviewed carefully

## Theme and Styling

- theme/visual-edition.css
- theme/visual-edition.js
- styles/pdf-export.css

Use small incremental style changes and verify rendering in browser and print output.
