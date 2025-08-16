import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

async function fetchTranslations() {
    const res = await fetch(`${process.env.API_URL}/translate`);
    if (!res.ok) throw new Error(`Failed to fetch translations: ${res.statusText}`);

    const { results } = await res.json();

    return results.reduce((acc, item) => {
        acc[item.name] = item.key_values;
        return acc;
    }, {});
}

function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
            current[key] = value;
        } else {
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }
    }
}

function transformMessages(flatMessages, locale) {
    const localeKey = `name_${locale}`;
    const nestedMessages = {};

    for (const [key, value] of Object.entries(flatMessages)) {
        const translated = value[localeKey] || key; // fallback to key if missing
        setNestedValue(nestedMessages, key, translated);
    }

    return nestedMessages;
}

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    const rawMessages = await fetchTranslations();
    const messages = transformMessages(rawMessages, locale);
    
    return { locale, messages };
});
