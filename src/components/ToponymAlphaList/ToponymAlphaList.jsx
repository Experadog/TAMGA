import chevron from '@/assets/icons/chevron.svg';
import seeMap from '@/assets/icons/seeOnMap.svg';
import { Link } from '@/i18n/navigation';
import { getLocalizedValue } from '@/lib/utils';
import Image from 'next/image';
import cl from './ToponymAlphaList.module.scss';

function firstLetter(title) {
  const t = (title || '').trim();
  if (!t) return '#';
  // нормализуем Ё→Е и латиницу к верхнему регистру
  const ch = t[0].toUpperCase();
  return ch === 'Ё' ? 'Е' : ch;
}

export default function ToponymAlphaList({ items, locale }) {
  const groups = items.reduce((acc, it) => {
    const title = getLocalizedValue(it, 'name', locale) || '';
    const key = firstLetter(title);
    (acc[key] ||= []).push(it);
    return acc;
  }, {});

  // порядок букв как пришёл
  const letters = Object.keys(groups);

  return (
    <div className={cl.wrap}>
      {letters.map(letter => {
        const list = groups[letter]
          .slice()
          .sort((a, b) =>
            (getLocalizedValue(a, 'name', locale) || '')
              .localeCompare(getLocalizedValue(b, 'name', locale) || '', 'ru')
          );
        // разбиваем на 4 колонки (как в макете)
        const cols = 3;
        const perCol = Math.ceil(list.length / cols);
        const chunks = Array.from({ length: cols }, (_, i) => list.slice(i * perCol, (i + 1) * perCol));

        return (
          <section key={letter} className={cl.section}>
            <div className={cl.titleBlock}>
              <h3 className={cl.letter}>{letter}</h3>
              <Link
                className={cl.link}
                href={{
                  pathname: `/map`,
                  query: {
                    startswith: letter.toLowerCase(),
                    offset: '0',
                    language: locale,
                  },
                }}
                scroll={true}
              >
                <span className={cl.seeMap}>Посмотреть на карте</span>
                <Image src={seeMap} alt='' width={24} height={24} />
              </Link>
            </div>
            <div className={cl.columns}>
              {chunks.map((chunk, ci) => (
                <ul key={ci} className={cl.col} role="list">
                  {chunk.map(it => {
                    const title = getLocalizedValue(it, 'name', locale) || '';
                    const matches =
                      it.matching_toponyms_count_fixed ?? 0;
                    return (
                      <li key={it.id} className={cl.rowBlock}>
                        <Link href={`/${it.slug}`} className={cl.row} prefetch={false}>
                          <span className={cl.link} >{title}</span>
                        </Link>
                        <Link
                          href={{
                            pathname: `/glossary/${it.name_en}`,
                            query: { search: it.name_en }
                          }}
                          className={cl.row}
                          prefetch={false}
                        >
                          <span className={cl.meta}>
                            {matches} совпадений
                          </span>
                          <Image className={cl.chev} src={chevron} alt='' width={10} height={10} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}