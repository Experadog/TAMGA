import sanitizeHtml from 'sanitize-html';

export function cleanHtml(html) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'li', 'ol', 'b', 'i', 'a'],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel', 'name', 'class']
    },
  });
}
