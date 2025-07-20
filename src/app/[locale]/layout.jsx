import { Onest } from "next/font/google";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer/Footer";

import "../../assets/styles/main.scss";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
});

// export async function generateMetadata({ params }) {
//   const { locale } = await params;
//   return { title: 'KG MAP' };
// }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);
  return (
    <html lang={locale}>
      <body className={onest.variable}>
        <NextIntlClientProvider>
          {/* <Header /> */}
          <main className="main container">{children}</main>
          {/* <Footer /> */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
