import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

async function fetchTranslations() {
    const res = await fetch(`${process.env.API_URL}/translate/?limit=300`, {
        cache: 'no-store'
    });
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
        const translated = value[localeKey] || null; // важно: null → будет заменён fallbackом
        setNestedValue(nestedMessages, key, translated);
    }

    return nestedMessages;
}

// 🔥 ГЛАВНОЕ — глубокое слияние локалей
function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (
            typeof source[key] === 'object' &&
            source[key] !== null &&
            !Array.isArray(source[key])
        ) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            if (source[key] !== null) {
                target[key] = source[key];
            }
        }
    }
    return target;
}

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    // 1) Загружаем ВСЕ переводы один раз
    const rawMessages = await fetchTranslations();

    // 2) Получаем сообщения для defaultLocale — это база
    const baseMessages = transformMessages(rawMessages, routing.defaultLocale);

    // 3) Локаль пользователя
    const userMessages = transformMessages(rawMessages, locale);

    // 4) 🔥 Fallback merge: userMessages поверх baseMessages
    const messages = deepMerge(structuredClone(baseMessages), userMessages);

    return {
        locale,
        messages,

        onError(error) {
            if (error.code === 'MISSING_MESSAGE') return;
            console.error(error);
        },

        getMessageFallback({ key, namespace }) {
            return namespace ? `${namespace}.${key}` : key;
        }
    };
});
