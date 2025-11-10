export function getStartsWithByLocale(locale) {
    const map = { ru: 'а', ky: 'а', en: 'a' };
    return (map[locale] ?? 'а').toLowerCase();
}