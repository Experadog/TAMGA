'use client';

import human from '@/assets/icons/human.svg';
import search from '@/assets/icons/search.svg';
import Image from 'next/image';
import styles from './MainSearch.module.scss';


export const MainSearch = () => {

  const onSubmit = (q) => {
    // сюда свою логику поиска
    // router.push(`/map?search=${encodeURIComponent(q)}`);
    console.log('search:', q);
  };

  const onWhereAmI = () => {
    // геолокация/центр карты/и т.п.
    console.log('where am I');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get('q')?.trim() || '';
    onSubmit?.(value);
  };

  return (
    <div className={styles.mainSearch}>
      <form className={styles.card} onSubmit={handleSubmit} role="search" aria-label="Главный поиск">
        <div className={styles.field}>
          <span className={styles.iconSearch} aria-hidden="true">
            {/* Лупа (SVG) */}
            <Image className={styles.labelSearch} src={search} width={24} height={24} alt="" />
          </span>
          <input
            className={styles.input}
            type="search"
            name="q"
            autoComplete="off"
            placeholder={'Поиск топонимов'}
          />
        </div>

        <button
          type="button"
          className={styles.whereBtn}
          onClick={onWhereAmI}
        >
          <span className={styles.iconAnchor} aria-hidden="true">
            {/* Якорь (SVG) */}
            <Image className={styles.labelHuman} src={human} width={24} height={24} alt="" />
          </span>
          Где я?
        </button>
      </form>
    </div>
  );
};