# License Decision Note

This decision has been resolved and a dual-license structure has been committed to the repository in the `LICENSE` file.

## Why This Note Exists

To avoid making incorrect legal assumptions, a license should not be guessed. We documented the alternatives here before making the decision.

## Decision Required

Repository maintainers should choose and commit an explicit license file.
**Decision: Dual license (MIT for code, CC BY 4.0 for content) has been adopted.**

## Current Blockers

- ~~no explicit decision on content license for handbook text and diagrams~~ (Resolved: CC BY 4.0)
- ~~no explicit decision on code/tooling license for scripts and workflows~~ (Resolved: MIT)
- ~~no published guidance on whether dual licensing is preferred~~ (Resolved: Dual license preferred and implemented)

Common options for documentation-focused projects include:

- MIT
- Apache-2.0
- CC BY 4.0 (for content-heavy docs)
- Dual-license combinations

## Maintainer-Friendly Recommendation Framework

If you want broad reuse with low friction:

- consider MIT or Apache-2.0 for code assets
- consider CC BY 4.0 for handbook prose and diagrams

If you prefer a single license across all assets:

- choose one permissive option and document tradeoffs explicitly

## Recommended Next Step

1. ~~Decide licensing intent for:~~
   - ~~handbook text~~
   - ~~diagrams and visuals~~
   - ~~scripts and workflow files~~
2. ~~Add LICENSE (and NOTICE if needed).~~
3. ~~Update README.md and this note accordingly.~~

Until then, reuse permissions are undefined. (Resolved: Reuse permissions are explicitly defined in `LICENSE`).
