import Analytics from "@/components/Analytics/Analytics";
import { Header } from "@/components/Header";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Onest } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../../assets/styles/main.scss";

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
          {GA_ID ? <Analytics gaId={GA_ID} /> : null}
          <Header locale={locale} />
          <main className="main container">{children}</main>
          {/* <Footer /> */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
