# Manual GitHub Settings Checklist

Apply these settings in GitHub UI to complete repository discoverability and governance setup.

## 1) Set Repository Description

- Go to repository home page.
- Click the settings icon in the About panel.
- Paste the recommended description from docs/repo-metadata.md.

## 2) Set Website URL

- In the same About panel, set website to:
  - https://lavkushry.github.io/The-Rust-Mastery-Handbook/
- Only set this after verifying Pages deployment.

## 3) Add Topics

- Use ranked topics from docs/github-topics.md.
- Start with the top 10 and expand to 15 if still precise.

## 4) Upload Social Preview Image

- Settings > General > Social preview.
- Use specs from docs/social-preview-spec.md.

## 5) Verify Discussions Choice

- Enable Discussions if you want question and idea routing there.
- Seed categories and starter threads from docs/discussions-seed.md.

## 6) Enable Private Vulnerability Reporting (Optional but Recommended)

- Security tab > Advisories > enable private reporting.
- Keep SECURITY.md instructions aligned.

## 7) Confirm Branch Protection

For main branch:

- require pull request before merging
- require status checks to pass
- block force pushes
- block branch deletion

## 8) Confirm Required Checks

At minimum require:

- Build Book workflow status check

Optionally require:

- Deploy workflow checks where appropriate

## 9) Define Labels Strategy

- Seed labels using docs/labels-guide.md.
- Keep core labels and contributor-readiness labels visible.

## 10) Publish First Structured Release

- Use docs/release-checklist.md and docs/release-strategy.md.
- Ensure changelog entries are curated first.

## 11) Review Sponsor Button Settings

- Configure .github/FUNDING.yml only when real funding channels are available.
- Avoid placeholder sponsor links in public UI.
