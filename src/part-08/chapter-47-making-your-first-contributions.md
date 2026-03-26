# Chapter 47: Making Your First Contributions
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--ownership);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Contribution Ladder</div><h2 class="visual-figure__title">The Safest Path Upward in Scope</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Contribution ladder from docs to tests to diagnostics to bug fixes to small features">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(230,57,70,0.16)"></rect>
        <rect x="76" y="302" width="388" height="40" rx="14" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect>
        <text x="240" y="327" class="svg-small" style="fill:#0b5e73;">docs and examples</text>
        <rect x="108" y="244" width="324" height="40" rx="14" fill="#edf8f1" stroke="#52b788" stroke-width="3"></rect>
        <text x="246" y="269" class="svg-small" style="fill:#1f6f4d;">tests and regressions</text>
        <rect x="138" y="186" width="264" height="40" rx="14" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect>
        <text x="226" y="211" class="svg-small" style="fill:#8f5d00;">error quality</text>
        <rect x="168" y="128" width="204" height="40" rx="14" fill="#fff1eb" stroke="#e76f51" stroke-width="3"></rect>
        <text x="230" y="153" class="svg-small" style="fill:#8f3d22;">local bug fix</text>
        <rect x="198" y="70" width="144" height="40" rx="14" fill="#fce7f3" stroke="#ff006e" stroke-width="3"></rect>
        <text x="232" y="95" class="svg-small" style="fill:#a00052;">small feature</text>
        <text x="92" y="366" class="svg-small" style="fill:#6b7280;">climb only when scope, blast radius, and review cost remain legible</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--ownership);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">PR Anatomy</div><h2 class="visual-figure__title">A Good First Pull Request Lowers Uncertainty</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Diagram of high-signal PR structure with summary, reproduction, change, verification, and limited blast radius">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="76" y="60" width="388" height="52" rx="16" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect>
        <text x="234" y="91" class="svg-small" style="fill:#dbeafe;">summary</text>
        <rect x="76" y="124" width="388" height="52" rx="16" fill="#1d3557" stroke="#457b9d" stroke-width="3"></rect>
        <text x="216" y="155" class="svg-small" style="fill:#e0f2fe;">reproduction steps</text>
        <rect x="76" y="188" width="388" height="52" rx="16" fill="#231942" stroke="#8338ec" stroke-width="3"></rect>
        <text x="244" y="219" class="svg-small" style="fill:#efe8ff;">change</text>
        <rect x="76" y="252" width="388" height="52" rx="16" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect>
        <text x="224" y="283" class="svg-small" style="fill:#d9fbe9;">verification</text>
        <rect x="76" y="316" width="388" height="40" rx="16" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect>
        <text x="144" y="341" class="svg-small" style="fill:#8f5d00;">small scope, clear invariant, easy review path</text>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem

Most bad first contributions are not technically bad. They are socially or structurally bad:

- too large
- too unclear
- under-tested
- solving the wrong thing
- surprising maintainers with avoidable churn

The first contribution problem is really a judgment problem.

## Step 2 - Rust's Design Decision

Rust projects usually reward small, explicit, test-backed changes. The ecosystem leans toward:

- reviewable diffs
- visible invariants
- tool-clean PRs
- tests that pin the bug or feature

Rust accepted:

- ceremony around `fmt`, `clippy`, and tests
- slower first contribution speed in exchange for maintainability

Rust refused:

- "ship the patch and explain later"
- vague review narratives

## Step 3 - The Mental Model

Plain English rule: your first job as a contributor is not to prove brilliance. It is to lower reviewer uncertainty.

Good first PRs do that by being:

- narrow
- reproducible
- well-explained
- tool-clean

## Step 4 - Minimal Code Example

The real "code example" here is a PR structure:

```markdown
## Summary
Fix panic when parsing empty config path.

## Reproduction
1. Run `tool --config ""`
2. Observe panic in `src/config.rs`

## Change
- Return `ConfigError::EmptyPath` instead of calling `unwrap`
- Add regression test

## Verification
- `cargo test`
- `cargo clippy`
- Manual reproduction now returns the expected error
```

## Step 5 - Walkthrough

Why this PR shape works:

1. reviewer knows what changed
2. reviewer knows why it matters
3. reviewer can reproduce the old behavior
4. reviewer can inspect the invariant the patch preserves
5. reviewer can trust verification was done

This is the contribution equivalent of good Rust typing: make the contract visible.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Start with small changes that have clear before-and-after behavior.

### Level 2 - Engineer

The contribution ladder is real:

- docs
- tests
- error messages
- tiny bug fixes
- small features

Skipping directly to "major redesign" is usually a mistake unless maintainers explicitly asked for it.

### Level 3 - Systems

Maintainers are not only checking correctness. They are checking:

- blast radius
- semver risk
- future maintenance burden
- consistency with project architecture
- reviewer time cost

A great first PR is one whose correctness and maintenance cost are both legible.

## Choosing a Good First Issue

Strong criteria:

- reproducible with current main branch
- small blast radius
- clear owning module
- testable without giant harness changes
- little or no unresolved architecture debate

Weak criteria:

- label says "good first issue" but discussion is stale and unclear
- feature request touches many crates or public APIs
- bug only reproduces under rare platform-specific or feature-specific conditions you cannot validate

A safe first issue is often one where you can write the failing test before touching implementation.

## The Contribution Ladder

Good order:

1. docs and examples
2. tests and regressions
3. error quality and diagnostics
4. local bug fix
5. small feature under existing architecture

This order is not about status. It is about learning where project quality actually lives.

## Bug Reproduction and Minimal Fixes

Use this sequence:

1. reproduce exactly
2. shrink the reproduction
3. identify the owning module
4. read tests before code changes
5. add or update the failing test first if possible

Minimal fixes teach maximum Rust because they force you to preserve the repo's invariants instead of rewriting around them.

Examples of high-value small fixes:

- replace `unwrap()` in library code with a typed error
- tighten a string or path boundary from owned to borrowed if semantically correct
- add missing context to top-level errors
- shrink a clone-heavy path to borrowing
- add regression coverage for an ownership edge case

## Writing High-Signal PRs

Structure every PR around:

- summary
- motivation or linked issue
- concrete change list
- verification
- known limitations or follow-up if relevant

Reviewers should not have to reverse-engineer your reasoning from the diff alone.

## Communicating Well in Review

Strong review responses:

- "I reproduced this on current main and added a failing test first."
- "I took approach A rather than B because this path keeps the existing error contract."
- "I addressed the comments; the only unresolved point is whether the API should stay public."

Weak responses:

- "fixed"
- "works on my machine"
- "I changed a few unrelated files while I was in there"

## Why PRs Get Closed

Common causes:

- unclear motivation
- too-large scope
- no tests for nontrivial behavior
- architecture disagreement discovered late
- stale branch and no reviewer response
- breaking style or semver expectations unintentionally

The lesson is not "maintainers are picky." The lesson is that reviewability is part of correctness in collaborative software.

## Step 7 - Common Misconceptions

Wrong model 1: "The best first PR is the most technically ambitious one I can complete."

Correction: the best first PR is the one that proves you understand the repo's expectations.

Wrong model 2: "Docs and tests are low-status contributions."

Correction: they are often the fastest path to learning the codebase's actual contract.

Wrong model 3: "If the patch is correct, the PR description can be short."

Correction: correctness without explanation still creates reviewer uncertainty.

Wrong model 4: "Requested changes mean the PR was bad."

Correction: requested changes are normal collaboration. The real signal is how well you respond.

## Step 8 - Real-World Pattern

Strong maintainers in Rust projects usually like:

- focused diffs
- regression tests
- minimal public-surface change
- tool-clean code
- respectful technical discussion

That pattern is visible across library crates, CLI tools, async services, and compiler work.

## Step 9 - Practice Block

### Code Exercise

Write a PR description for a tiny bug fix that replaces an `unwrap` in library code with a typed error and a regression test.

### Code Reading Drill

Read an issue and answer:

- what invariant is broken?
- can I reproduce it?
- what file probably owns the fix?

### Spot the Bug

Why is this PR strategy weak?

```text
Touch 12 files, refactor names, fix one bug, add one feature, no tests, short PR title.
```

### Refactoring Drill

Take an oversized change idea and split it into:

- one reviewable first PR
- one later follow-up

### Compiler Error Interpretation

If a "simple" PR starts surfacing many unrelated compiler errors, translate that as: "I probably widened scope into architecture territory instead of keeping the fix local."

## Step 10 - Contribution Connection

After this chapter, you can:

- choose safer first issues
- write reviewer-friendly PRs
- reproduce bugs systematically
- respond to feedback without losing momentum

Good first PRs include:

- regression tests
- better error messages
- docs for unclear APIs
- tiny behavior fixes with a clear reproduction

## In Plain English

Your first contribution should make a maintainer's life easier, not more uncertain. That matters because open source is collaborative work, and even a correct patch is hard to merge if reviewers cannot quickly see what it changes and why it is safe.

## What Invariant Is Rust Protecting Here?

Contributions should preserve project invariants while minimizing reviewer uncertainty about correctness, scope, and maintenance cost.

## If You Remember Only 3 Things

- Start smaller than your ego wants.
- A failing test or exact reproduction is worth more than a long explanation without proof.
- PR quality is measured by clarity and blast radius, not only by technical ambition.

## Memory Hook

Your first PR should be like a clean surgical stitch, not a dramatic emergency-room reconstruction.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is the real job of a first contribution? | To lower reviewer uncertainty while preserving repo invariants. |
| What is the safest contribution ladder? | Docs/examples, tests, error quality, local bug fix, then small feature work. |
| What makes an issue a good first target? | Reproducible, small blast radius, clear owner, and easy to test. |
| Why is a failing test so valuable? | It proves the bug and constrains the fix. |
| What should every nontrivial PR description include? | Summary, motivation, change list, and verification. |
| Why do PRs get closed even when code is partly correct? | Scope, clarity, reviewability, or architecture fit may be poor. |
| Are requested review changes a bad sign? | No. They are normal collaboration. |
| What is a common bad first-PR pattern? | Mixing unrelated refactors with the claimed fix. |

## Chapter Cheat Sheet

| Goal | Best move | Why |
|---|---|---|
| learn repo safely | fix tests/docs/errors first | low blast radius |
| prove bug | shrink reproduction | reviewer trust |
| improve reviewability | small focused PR | easier merge path |
| respond to review well | explain reasoning and changes | collaboration quality |
| avoid closure | separate unrelated work | scope discipline |

---
