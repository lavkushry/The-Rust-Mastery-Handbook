# Editorial Style Guide

This guide keeps handbook content consistent, accurate, and readable for serious technical audiences.

## Tone

Use a practical, first-principles, systems-oriented tone.

Preferred tone traits:

- direct and precise
- explanatory rather than performative
- technically grounded
- respectful of reader intelligence

Avoid:

- hype language
- vague motivational claims
- unnecessary jargon without explanation

## Explanation Depth

Default structure for concept sections:

1. Problem context
2. Design rationale
3. Mental model
4. Concrete example
5. Practical implications

When possible, explain why a rule exists before describing syntax mechanics.

## Consistency Rules

- Use stable terminology for core Rust concepts.
- Keep chapter-level naming patterns consistent.
- Prefer one term per concept in a section (for example, avoid switching between model and frame unpredictably).

## Code Block Style

- Use fenced code blocks with language hints when known.
- Keep examples minimal and purposeful.
- Do not include decorative code snippets.
- For command blocks, use bash fences.

## Heading Patterns

Recommended heading progression:

- H1 for page title only
- H2 for major concept sections
- H3 for subtopics and workflows

Keep headings concrete and intent-oriented.

## Glossary Usage

- Link first use of advanced terms to glossary when helpful.
- Avoid redefining the same term differently across chapters.
- Prefer concise definitions over overloaded descriptions.

## Diagram Conventions

- Each diagram should communicate one primary idea.
- Include role and aria-label attributes for inline SVG accessibility.
- Keep labels legible and technically precise.
- Avoid decorative diagrams without instructional value.

## Accessibility Expectations

- Use descriptive link text (avoid generic click here).
- Keep list structures clear and scannable.
- Preserve adequate contrast and readability in diagram text.
- Ensure visual content has textual explanation nearby.

## Cross-Linking

When relevant, add links to:

- related chapters
- appendices
- FAQ and troubleshooting pages
- contribution and support docs

Internal links should reduce reader search friction.
