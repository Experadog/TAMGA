import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'ky', 'ru'],
    defaultLocale: 'ky',
});