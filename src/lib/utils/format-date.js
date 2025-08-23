export const formatDate = (dateString, locale) => {
    const date = new Date(dateString);
    
    // Определяем локаль для Intl.DateTimeFormat
    let intlLocale;
    switch (locale) {
        case 'ru':
            intlLocale = 'ru-RU';
            break;
        case 'en':
            intlLocale = 'en-US';
            break;
        case 'ky':
            intlLocale = 'ky-KG'; // Киргизская локаль
            break;
        default:
            intlLocale = 'ru-RU'; // По умолчанию русский
    }

    const formattedDate = new Intl.DateTimeFormat(intlLocale, {
        day: 'numeric',
        month: 'long'
    }).format(date);

    return `${formattedDate}, ${date.getFullYear()}`;
};
