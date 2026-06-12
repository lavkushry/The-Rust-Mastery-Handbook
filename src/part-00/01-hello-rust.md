# Hello, Rust

<div class="one-sentence">
  If you only remember one thing: <strong>installing Rust is one command, and from that point on <code>cargo</code> is the only tool you will touch.</strong>
</div>

## Install in one command

Open a terminal and run:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Accept the default when it asks. When it finishes, close the terminal and open a new one. You now have:

- `rustc` — the compiler
- `cargo` — the thing you will actually use
- `rustup` — the updater you will forget exists

If you are uncomfortable curl-pipe-shelling a script, the same installer is available as a native package on every major OS. The official instructions at [rust-lang.org/tools/install](https://www.rust-lang.org/tools/install) list every option.

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>Rust's package manager is called Cargo. Cargo is <strong>npm, pip, pipenv, virtualenv, make, and the test runner — all in one binary, the same on every OS.</strong> You will use four Cargo commands in this whole book. You will learn them in the next paragraph.</p>
</div>

## The four Cargo commands you actually use

```bash
cargo new hello      # make a new project
cargo run            # compile and run it
cargo test           # run the tests
cargo build --release  # make the fast binary for production
```

That is it. There are many more Cargo commands, but these four will carry you through the first three months.

## Hello, world

Run this:

```bash
cargo new hello
cd hello
cargo run
```

Cargo made a tiny project for you and ran it. You will see something like:

```
   Compiling hello v0.1.0 (/tmp/hello)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.81s
     Running `target/debug/hello`
Hello, world!
```

Open `src/main.rs` in your editor. It looks like this:

```rust
fn main() {
    println!("Hello, world!");
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20main%28%29%20%7B%0A%20%20%20%20println%21%28%22Hello%2C%20world%21%22%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

<figure class="visual-figure" style="--chapter-accent: var(--compiler);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Anatomy</div>
      <h2 class="visual-figure__title">Every piece of "hello world" in one picture</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 960 360" role="img" aria-label="Anatomy diagram labeling fn, main, parentheses, braces, println exclamation mark, string literal, and semicolon in a hello world program.">
      <rect x="20" y="20" width="920" height="320" rx="24" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <text x="60" y="140" style="font-family:var(--font-code);font-size:36px;fill:#023e8a">fn</text>
      <text x="140" y="140" style="font-family:var(--font-code);font-size:36px;fill:#1a1a2e">main</text>
      <text x="250" y="140" style="font-family:var(--font-code);font-size:36px;fill:#6d6875">()</text>
      <text x="300" y="140" style="font-family:var(--font-code);font-size:36px;fill:#6d6875">{</text>
      <text x="120" y="210" style="font-family:var(--font-code);font-size:32px;fill:#219ebc">println</text>
      <text x="278" y="210" style="font-family:var(--font-code);font-size:32px;fill:#d62828">!</text>
      <text x="296" y="210" style="font-family:var(--font-code);font-size:32px;fill:#6d6875">(</text>
      <text x="316" y="210" style="font-family:var(--font-code);font-size:32px;fill:#2d6a4f">"Hello, world!"</text>
      <text x="556" y="210" style="font-family:var(--font-code);font-size:32px;fill:#6d6875">);</text>
      <text x="60" y="278" style="font-family:var(--font-code);font-size:36px;fill:#6d6875">}</text>
      <path d="M80 152 L 80 250" stroke="#023e8a" stroke-width="2" fill="none"></path>
      <text x="88" y="268" style="font-family:var(--font-display);font-size:12px;fill:#023e8a">"fn" declares a function</text>
      <path d="M160 152 L 160 292" stroke="#1a1a2e" stroke-width="2" fill="none"></path>
      <text x="168" y="310" style="font-family:var(--font-display);font-size:12px;fill:#1a1a2e">"main" is where every program starts</text>
      <path d="M288 220 L 288 288" stroke="#d62828" stroke-width="2" fill="none"></path>
      <text x="296" y="306" style="font-family:var(--font-display);font-size:12px;fill:#d62828">"!" means this is a macro, not a function</text>
      <path d="M578 220 L 578 270" stroke="#6d6875" stroke-width="2" fill="none"></path>
      <text x="586" y="288" style="font-family:var(--font-display);font-size:12px;fill:#6d6875">semicolons end statements</text>
    </svg>
  </div>
</figure>

Read the picture. That is the whole program. The only piece that will surprise a Python or JavaScript reader is the `!` after `println`. It marks a *macro* — a compile-time code generator. Rust has macros so that tiny features like string formatting do not need to be built into the language itself. For now, treat `println!` as just "the thing that prints".

## What just happened

<div class="analogy-card">
  <div class="analogy-card__head">The flow</div>
  <div class="analogy-card__body">
    <ol>
      <li><code>cargo new hello</code> made a directory with a <code>Cargo.toml</code> (the project manifest) and a <code>src/main.rs</code> (the code).</li>
      <li><code>cargo run</code> asked the compiler to turn <code>src/main.rs</code> into a native binary at <code>target/debug/hello</code>, then ran it.</li>
      <li>Your OS printed <code>Hello, world!</code> to the terminal. No virtual machine, no interpreter — just a binary, the same kind a C program would have produced.</li>
    </ol>
  </div>
</div>


What actually happened when you typed those commands? Step through the journey from source file to text on your screen.

<div class="rust-viz" data-eyebrow="Cargo Universe" data-title="From cargo run to Hello, World" data-accent="var(--compiler)">
<script type="application/json">
{
  "code": [
    "fn main() {",
    "    println!(\"Hello, world!\");",
    "}"
  ],
  "columns": ["Pipeline", "Artifacts"],
  "steps": [
    {
      "line": 1,
      "caption": "cargo run first builds: Cargo reads Cargo.toml, then hands your source to rustc, which compiles and links it into a real native executable — the same kind of binary a C compiler produces. No interpreter, no virtual machine.",
      "stack": [{"frame": "cargo build", "vars": [{"name": "rustc", "value": "compiles src/main.rs", "state": "plain"}, {"name": "linker", "value": "produces the executable", "state": "plain"}]}],
      "heap": [{"id": "bin", "label": "target/debug/hello", "value": "native machine code, self-contained", "state": "alive"}]
    },
    {
      "line": 1,
      "caption": "Then it runs: the operating system loads the binary into memory and jumps to main. Your program is now just a process, with a stack frame for main like any other function.",
      "stack": [{"frame": "your program (process)", "vars": [{"name": "main", "value": "stack frame created", "state": "plain"}]}],
      "heap": [{"id": "bin", "label": "target/debug/hello", "value": "loaded & executing", "state": "alive"}]
    },
    {
      "line": 2,
      "caption": "println! formats the text and writes it to standard output. The string \"Hello, world!\" lives inside the binary itself — no allocation needed. main returns, the process exits with code 0, and Cargo's job is done.",
      "note": {"kind": "ok", "text": "source → rustc → native binary → process → stdout. Every Rust program you ever build follows this path."},
      "stack": [{"frame": "your program (process)", "vars": [{"name": "main", "value": "returned — exit code 0", "state": "plain"}]}],
      "heap": [{"id": "out", "label": "stdout", "value": "Hello, world!", "state": "alive"}]
    }
  ]
}
</script>
<p class="rust-viz__fallback">Interactive simulation (requires JavaScript): cargo run compiles your source with rustc into a self-contained native binary, the OS loads it and calls main, and println! writes the literal (stored in the binary itself) to standard output.</p>
</div>
## Try this

<div class="try-this">
  <div class="try-this__head">Two-minute exercises</div>
  <ol>
    <li>Change <code>"Hello, world!"</code> to your name. Run it.</li>
    <li>Add a second <code>println!</code> on the next line. Run it.</li>
    <li>Delete one of the semicolons on purpose and run it. <strong>Read the error Rust gives you.</strong> Notice how it points exactly at the character that is wrong. That is what Rust errors look like. You will read many of them this week.</li>
  </ol>
</div>

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>You just compiled a native binary with one command. The same binary will run on this machine without Rust installed. That is what "systems language" means: you are producing the real thing, not a script that needs an interpreter on the other end.</p>
</div>

Next up: the <code>let</code> keyword, and Rust's quiet opinion that data should not change unless you ask it to.

<a href="02-values-bindings-and-mutability.md">Values, names, and the "let" word →</a>
