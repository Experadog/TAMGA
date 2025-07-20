export function stripHtmlTags(html = '') {
  if (typeof html !== 'string') return '';

  // Удаляем HTML-теги
  let stripped = html.replace(/<[^>]*>/g, '').trim();

  // Декодируем HTML-сущности
  if (typeof window !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = stripped;
    stripped = temp.textContent || temp.innerText || '';
  }

  return stripped;
}
