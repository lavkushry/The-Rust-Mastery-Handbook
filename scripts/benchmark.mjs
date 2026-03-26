import { performance } from "node:perf_hooks";
import { escapeHtml } from "./utils.mjs";

const ITERATIONS = 1_000_000;

const testCases = [
  { name: "No special chars", input: "The quick brown fox jumps over the lazy dog." },
  { name: "Some special chars", input: 'The "quick" <brown> fox & \'lazy\' dog.' },
  { name: "All special chars", input: '&<>"\'&<>"\'&<>"\'&<>"\'' },
  { name: "Long string with mixed content", input: `
    <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <h1>Hello & "Welcome"</h1>
        <p>It's a beautiful day.</p>
        <p>1 < 2 && 3 > 1</p>
      </body>
    </html>
  ` }
];

console.log(`Running benchmark with ${ITERATIONS} iterations...\\n`);

for (const { name, input } of testCases) {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    escapeHtml(input);
  }
  const end = performance.now();
  const time = end - start;

  console.log(`Test: ${name}`);
  console.log(`Time: ${time.toFixed(2)} ms`);
  console.log(`Ops/sec: ${((ITERATIONS / time) * 1000).toFixed(0)}\\n`);
}
