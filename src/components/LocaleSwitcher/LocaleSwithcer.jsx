import { useLocale, useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import { LocaleSelect } from './LocaleSelect';

function LocaleSwitcher() {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();

    return (
        <LocaleSelect defaultValue={locale}>
            {routing.locales.map((cur) => (
                <option key={cur} value={cur}>
                    {t(cur)}
                </option>
            ))}
        </LocaleSelect>
    );
};

export { LocaleSwitcher };