export function stripHtmlTags(html = '') {
  if (typeof html !== 'string') return '';

  // Удаляем HTML-теги
  let stripped = html.replace(/<[^>]*>/g, '').trim();

  // Декодируем HTML-сущности
  if (typeof window !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = stripped;
    stripped = temp.textContent || temp.innerText || '';
  } else {
    // Server-side HTML entity decoding
    stripped = stripped
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`')
      .replace(/&#x3D;/g, '=');
  }

  return stripped;
}
