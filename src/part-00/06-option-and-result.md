# Option and Result

<div class="ferris-says">
<p>Your first null-pointer exception happened when some senior engineer returned <code>null</code> from a function and forgot to mention it in the docs. Rust does not let that happen. There is no <code>null</code>. If a function might fail to produce a value, it returns <code>Option&lt;T&gt;</code>. If it might fail with a reason, it returns <code>Result&lt;T, E&gt;</code>. You cannot use the value without first <em>answering the compiler</em> about what to do when it is missing. It feels like friction for about a day, and then it feels like relief.</p>
</div>

<div class="one-sentence">
  If you only remember one thing: <strong>in Rust, "might be missing" and "might have failed" are normal values the compiler will not let you ignore.</strong>
</div>

## The two enums that run the world

```rust
enum Option<T> {
    Some(T),
    None,
}

enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

That is all they are. Two tiny enums. And yet almost every function in the Rust standard library returns one of them, and together they eliminate two of the most common bug categories in software.

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>If something might be absent — "the first element of an empty list", "the value for a missing key" — the function returns <code>Option&lt;T&gt;</code>. If something might fail — "open this file", "parse this number" — it returns <code>Result&lt;T, E&gt;</code>. Rust will not let you touch the inner value until you have said what to do if it is missing or failed.</p>
</div>

## Option: "there might be a value here"

<figure class="visual-figure" style="--chapter-accent: var(--async);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Two boxes</div>
      <h2 class="visual-figure__title">Option&lt;T&gt; is a box. It contains a <code>T</code>, or it doesn't.</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 720 280" role="img" aria-label="Two boxes. One box labeled Some contains a shape T. Another box labeled None is empty. You cannot use T until you open the box and check.">
      <rect x="20" y="20" width="680" height="240" rx="20" fill="#fffdf8" stroke="rgba(58,134,255,0.14)"></rect>
      <rect x="60" y="60" width="280" height="160" rx="16" fill="#e6f0ff" stroke="#3a86ff" stroke-width="3"></rect>
      <text x="200" y="96" text-anchor="middle" style="font-family:var(--font-code);font-size:18px;fill:#1e3a8a">Some(T)</text>
      <circle cx="200" cy="160" r="36" fill="#3a86ff"></circle>
      <text x="200" y="166" text-anchor="middle" style="font-family:var(--font-display);font-size:18px;fill:#ffffff;font-weight:bold">T</text>
      <rect x="380" y="60" width="280" height="160" rx="16" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3" stroke-dasharray="6 6"></rect>
      <text x="520" y="96" text-anchor="middle" style="font-family:var(--font-code);font-size:18px;fill:#475569">None</text>
      <circle cx="520" cy="160" r="36" fill="#ffffff" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 4"></circle>
      <text x="520" y="166" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#94a3b8">empty</text>
    </svg>
  </div>
</figure>

Using an `Option`:

```rust
fn first_word(s: &str) -> Option<&str> {
    s.split_whitespace().next()
}

fn main() {
    match first_word("hello rust") {
        Some(w) => println!("first word is {w}"),
        None    => println!("no words"),
    }

    match first_word("") {
        Some(w) => println!("first word is {w}"),
        None    => println!("no words"),
    }
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20first_word%28s%3A%20%26str%29%20-%3E%20Option%3C%26str%3E%20%7B%0A%20%20%20%20s.split_whitespace%28%29.next%28%29%0A%7D%0A%0Afn%20main%28%29%20%7B%0A%20%20%20%20match%20first_word%28%22hello%20rust%22%29%20%7B%0A%20%20%20%20%20%20%20%20Some%28w%29%20%3D%3E%20println%21%28%22first%20word%20is%20%7Bw%7D%22%29%2C%0A%20%20%20%20%20%20%20%20None%20%20%20%20%3D%3E%20println%21%28%22no%20words%22%29%2C%0A%20%20%20%20%7D%0A%0A%20%20%20%20match%20first_word%28%22%22%29%20%7B%0A%20%20%20%20%20%20%20%20Some%28w%29%20%3D%3E%20println%21%28%22first%20word%20is%20%7Bw%7D%22%29%2C%0A%20%20%20%20%20%20%20%20None%20%20%20%20%3D%3E%20println%21%28%22no%20words%22%29%2C%0A%20%20%20%20%7D%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

There is no `null` in Rust. There never has been. "Maybe absent" is always spelled `Option<T>`, and the compiler forces you to handle the `None` case explicitly.

## Result: "this might have failed, here's why"

`Result<T, E>` is the same idea, but the empty box carries an explanation.

```rust
fn parse_age(s: &str) -> Result<u32, std::num::ParseIntError> {
    s.trim().parse::<u32>()
}

fn main() {
    match parse_age("30") {
        Ok(n)  => println!("you are {n}"),
        Err(e) => println!("that was not a number: {e}"),
    }

    match parse_age("thirty") {
        Ok(n)  => println!("you are {n}"),
        Err(e) => println!("that was not a number: {e}"),
    }
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20parse_age%28s%3A%20%26str%29%20-%3E%20Result%3Cu32%2C%20std%3A%3Anum%3A%3AParseIntError%3E%20%7B%0A%20%20%20%20s.trim%28%29.parse%3A%3A%3Cu32%3E%28%29%0A%7D%0A%0Afn%20main%28%29%20%7B%0A%20%20%20%20match%20parse_age%28%2230%22%29%20%7B%0A%20%20%20%20%20%20%20%20Ok%28n%29%20%20%3D%3E%20println%21%28%22you%20are%20%7Bn%7D%22%29%2C%0A%20%20%20%20%20%20%20%20Err%28e%29%20%3D%3E%20println%21%28%22that%20was%20not%20a%20number%3A%20%7Be%7D%22%29%2C%0A%20%20%20%20%7D%0A%0A%20%20%20%20match%20parse_age%28%22thirty%22%29%20%7B%0A%20%20%20%20%20%20%20%20Ok%28n%29%20%20%3D%3E%20println%21%28%22you%20are%20%7Bn%7D%22%29%2C%0A%20%20%20%20%20%20%20%20Err%28e%29%20%3D%3E%20println%21%28%22that%20was%20not%20a%20number%3A%20%7Be%7D%22%29%2C%0A%20%20%20%20%7D%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

<div class="analogy-card">
  <div class="analogy-card__head">Analogy</div>
  <div class="analogy-card__body">
    <p>Exceptions are mail that bypasses the postal system — they can appear anywhere, surprising you. <code>Result</code> is mail that is <em>addressed to a person</em>. If nobody opens it, your code refuses to compile. You can never forget to handle an error.</p>
  </div>
</div>

## The `?` operator: the short way to say "propagate the error"

Once you have a chain of fallible calls, writing `match` for each is noisy. Rust gives you `?`:

```rust
use std::fs;

fn read_age(path: &str) -> Result<u32, Box<dyn std::error::Error>> {
    let text = fs::read_to_string(path)?;    // if this errors, return the error
    let n    = text.trim().parse::<u32>()?;  // if this errors, return the error
    Ok(n)
}
```

`?` means "if this is `Ok`, give me the inner value and keep going. If this is `Err`, return it from the enclosing function immediately." It is the modern, idiomatic way to write fallible Rust. You will see it everywhere.

## `unwrap` and `expect`: use sparingly, use honestly

You will see code that writes:

```rust
let n = "30".parse::<u32>().unwrap();
```

`unwrap` says: "I am sure this will be `Ok`. If I am wrong, crash the program." `expect("a reason")` is the same thing but attaches a message. Both are fine in:

- Example code
- Prototypes
- Tests
- Places where you have *just* checked the value in a way the type system cannot see

They are not fine in production code for things that can fail in the real world (network, files, user input). For those, use `?` and handle the error honestly.

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>If it can fail because of something outside your program, <em>handle it</em>. If it can only fail because you wrote a bug, <code>unwrap</code> is fine.</p>
</div>

## wordc, step 5

Our through-line needs to handle the one way reading a file can fail — the file not existing. That is a `Result`.

```rust
use std::fs;
use std::io;

fn read_text(path: &str) -> Result<String, io::Error> {
    fs::read_to_string(path)
}

fn main() {
    match read_text("sample.txt") {
        Ok(text) => println!("read {} bytes", text.len()),
        Err(e)   => eprintln!("could not read sample.txt: {e}"),
    }
}
```

If the file is missing, Rust will not crash — it will tell you, in human words, what happened, on stderr. No silent zero, no null return, no magic. This is what "errors as data" looks like in practice.

<div class="ferris-says" data-variant="insight">
<p>The <code>?</code> operator you will meet in chapter 7 is the syntactic shortcut for "if this is <code>Err</code>, return the error up the stack; otherwise give me the inner value". It is one character and it carries the entire idea of "don't ignore errors, propagate them". Once you see it you will never go back to exceptions-that-can-come-from-anywhere.</p>
</div>

## Try this

<div class="try-this">
  <div class="try-this__head">Five-minute exercises</div>
  <ol>
    <li>Write a function <code>fn head(v: &amp;[i32]) -&gt; Option&lt;i32&gt;</code> that returns the first element of a slice, or <code>None</code>.</li>
    <li>Write a function <code>fn safe_div(a: f64, b: f64) -&gt; Result&lt;f64, &amp;'static str&gt;</code> that returns <code>Err("divide by zero")</code> if <code>b</code> is zero.</li>
    <li>Take the <code>read_age</code> example above and add a call to it in <code>main</code> that prints the result cleanly.</li>
  </ol>
</div>

## Check yourself

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quiz — 1 of 1</span><span>Option &amp; Result</span></div>
  <p class="quiz__q">A function <code>fn parse_age(s: &amp;str) -&gt; Result&lt;u32, ParseError&gt;</code> can succeed or fail. Which of these is the <em>idiomatic</em> way to get the number out?</p>
  <ul class="quiz__options">
    <li>Call <code>.unwrap()</code> everywhere and assume it works</li>
    <li>Ignore the error by assigning to <code>_</code> and moving on</li>
    <li>Use <code>match</code> to handle both <code>Ok</code> and <code>Err</code>, or use <code>?</code> to propagate the error to the caller</li>
    <li>Convert the error to a string and <code>println!</code> it</li>
  </ul>
  <div class="quiz__explain">Correct. In real code you either (a) <code>match</code> and decide what to do for each case, or (b) write <code>?</code> to say "if it failed, propagate; if it worked, give me the value and keep going". That is 95% of Rust error handling. <code>unwrap()</code> is for examples and tests only.</div>
  <div class="quiz__explain quiz__explain--wrong">Think about it: what do you do with a <code>Result</code> if you want to <em>do something different</em> when it fails vs when it succeeds?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

You now know enough Rust to build something real. Next: your first CLI.

<a href="07-your-first-cli.md">Your first CLI →</a>
