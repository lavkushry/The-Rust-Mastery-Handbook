/**
 * Escapes HTML special characters in a string.
 * @param {string} value - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHtml(value) {
  const str = String(value);
  let result = "";
  let lastIndex = 0;

  for (let i = 0; i < str.length; i++) {
    let escaped;
    switch (str.charCodeAt(i)) {
      case 38: // &
        escaped = "&amp;";
        break;
      case 60: // <
        escaped = "&lt;";
        break;
      case 62: // >
        escaped = "&gt;";
        break;
      case 34: // "
        escaped = "&quot;";
        break;
      case 39: // '
        escaped = "&#39;";
        break;
      default:
        continue;
    }

    if (lastIndex !== i) {
      result += str.substring(lastIndex, i);
    }
    result += escaped;
    lastIndex = i + 1;
  }

  if (lastIndex === 0) {
    return str;
  }

  if (lastIndex < str.length) {
    result += str.substring(lastIndex);
  }

  return result;
}
