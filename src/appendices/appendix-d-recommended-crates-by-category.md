# Appendix D — Recommended Crates by Category

| Category | Crate | Why it matters |
|---|---|---|
| CLI | `clap` | Industrial-strength argument parsing and help generation |
| CLI | `argh` | Smaller, simpler CLI parsing when `clap` would be heavy |
| CLI | `indicatif` | Progress bars and human-friendly terminal feedback |
| CLI | `ratatui` | Modern terminal UI development |
| Web | `axum` | Tower-based web framework with strong extractor model |
| Web | `hyper` | Lower-level HTTP building blocks |
| Web | `tower` | Middleware and service abstractions that shape much of async Rust |
| Web | `reqwest` | Ergonomic HTTP client for services and tools |
| Async | `tokio` | The dominant async runtime and ecosystem foundation |
| Async | `futures` | Core future combinators and traits |
| Async | `async-channel` | Useful channels outside Tokio-specific code |
| Serialization | `serde` | The central serialization framework |
| Serialization | `serde_json` | JSON support built on serde |
| Serialization | `toml` | TOML parsing and config handling |
| Serialization | `bincode` | Compact binary serialization when appropriate |
| Error handling | `thiserror` | Clean library error types |
| Error handling | `anyhow` | Ergonomic application-level error aggregation |
| Error handling | `eyre` | Alternative report-focused app error handling |
| Testing | `proptest` | Property-based testing |
| Testing | `insta` | Snapshot testing for output-heavy code |
| Testing | `criterion` | Real benchmarking and statistically meaningful comparisons |
| Logging/observability | `tracing` | Structured logs, spans, instrumentation |
| Logging/observability | `tracing-subscriber` | Subscriber and formatting ecosystem for tracing |
| Logging/observability | `metrics` | Metrics instrumentation with pluggable backends |
| Databases | `sqlx` | Async SQL with compile-time query checking options |
| Databases | `diesel` | Strongly typed ORM/query builder |
| Databases | `sea-query` | Flexible SQL query construction |
| FFI | `bindgen` | Generate Rust bindings from C headers |
| FFI | `cbindgen` | Generate C headers from Rust APIs |
| FFI | `libloading` | Dynamic library loading |
| Parsing | `nom` | Byte/string parsing via combinators |
| Parsing | `winnow` | Parser combinator library with modern ergonomics |
| Parsing | `pest` | Grammar-driven parser generation |
| Crypto | `ring` | Production-grade crypto primitives |
| Crypto | `rustls` | Modern TLS implementation in Rust |
| Crypto | `sha2` | Standard SHA-2 hashing primitives |
| Data structures | `indexmap` | Hash map with stable iteration order |
| Data structures | `smallvec` | Inline-small-vector optimization |
| Data structures | `bytes` | Efficient shared byte buffers for networking |
| Data structures | `dashmap` | Concurrent map with tradeoffs worth understanding |
| Utilities | `uuid` | UUID generation and parsing |
| Utilities | `chrono` | Date/time handling |
| Utilities | `regex` | Mature regular-expression engine |
| Utilities | `rayon` | Data parallelism with work-stealing |

### Crate Selection Rules

- Prefer boring, battle-tested crates over novelty.
- Prefer ecosystem-standard crates when joining an existing codebase.
- Prefer fewer dependencies when a standard-library solution is enough.
- Evaluate crate APIs through semver behavior, maintenance quality, docs, and unsafe surface area.

---
