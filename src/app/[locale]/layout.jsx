import Analytics from "@/components/Analytics/Analytics";
import { Header } from "@/components/Header";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Onest } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Suspense } from "react";
import "../../assets/styles/main.scss";

export const metadata = {
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      // можно SVG:
      // { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: ['/favicon.ico'],
  },
};

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

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
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="" />
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { page_path: window.location.pathname });
        `}
            </Script>
          </>
        ) : null}
      </head>
      <body className={onest.variable}>
        <NextIntlClientProvider>
          {GA_ID ? (
            <Suspense fallback={null}>
              <Analytics gaId={GA_ID} />
            </Suspense>
          ) : null}
          <Header locale={locale} />
          <main className="main container">{children}</main>
          {/* <Footer /> */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
