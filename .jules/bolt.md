\
## 2024-05-24 - Node String Iteration Outperforms Regex Replace for HTML Escaping
**Learning:** For extremely hot paths in HTML processing, `String.prototype.replace` with a global regex and a callback function incurs significant overhead in V8/Node.js compared to a manual string iteration using `charCodeAt` and substring concatenation.
**Action:** When working on string processing bottlenecks, benchmark manually iterating the string length and accessing characters via `.charCodeAt()`. This often performs 40-75% better in tight loops compared to Regex + Callback replacements.
