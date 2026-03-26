/**
 * Escapes HTML special characters in a string.
 * @param {string} value - The string to escape.
 * @returns {string} The escaped string.
 */
const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

export function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (match) => ESCAPE_MAP[match]);
}
