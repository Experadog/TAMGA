import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import styles from './page.module.scss';

export default function Home({ params }) {
  const {locale} = use(params);

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <>
      
    </>
  );
}
