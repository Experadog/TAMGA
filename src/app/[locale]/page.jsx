import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import styles from './page.module.scss';
import MapClient from "@/components/Map/MapClient";

export default function Home({ params }) {
  const {locale} = use(params);

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div className={styles.container}>
      <div className={styles.mapWrapper}>
        <MapClient locale={locale} searchParams={{}} />
      </div>
    </div>
  );
}
