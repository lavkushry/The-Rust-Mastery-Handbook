/**
 * Escapes HTML special characters in a string.
 * @param {string} value - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
