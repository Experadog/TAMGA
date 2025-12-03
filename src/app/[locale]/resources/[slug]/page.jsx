import MainForm from '@/components/MainForm/MainForm';
import { routing } from '@/i18n/routing';
import { cleanHtml, getLocalizedValue, stripHtmlTags } from '@/lib/utils';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import clss from './page.module.scss';
import './styles.scss';

async function fetchData({ slug }) {
  try {
    const resp = await fetch(`${process.env.API_URL}/pages/${slug}`)

    if (!resp.ok) {
      if (resp.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const data = await resp.json();

    if (!data || !data.id) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching page data:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;

  const data = await fetchData({ slug });
  if (!data) { throw new Error('Page slug data not found') }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
  const pathname = `/${locale}/resources/${slug}`;
  const absoluteUrl = `${siteUrl}${pathname}`;

  const tMeta = await getTranslations({ locale, namespace: 'resources' });

  const pageName = getLocalizedValue(data, 'title', locale) || '';

  const title = tMeta('metadata.title', {
    pageSlugName: pageName,
  }) || '';


  const descriptionRaw = getLocalizedValue(data, 'description', locale);
  const description =
    stripHtmlTags(cleanHtml(descriptionRaw || pageName)).slice(0, 200);


  const shareImage = '/openGraph.png';

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pathname,
      languages: routing.locales.reduce((acc, loc) => {
        acc[loc] = `/${loc}/resources/${slug}`;
        return acc;
      }, {})
    },
    openGraph: {
      type: 'article',
      locale,
      siteName: 'Tamga.kg',
      url: absoluteUrl,
      title,
      description,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareImage]
    },

    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  };
}

export default async function pageResources({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const data = await fetchData({ slug });
  // if (!data) throw new Error('Post data not found');
  if (!data) notFound();

  const { image } = data;

  const title = getLocalizedValue(data, 'title', locale);
  const content = getLocalizedValue(data, 'description', locale);
  const cleanContent = cleanHtml(content);

  return (
    <>
      <div className={clss.blogWrapper}>
        <article className={clss.blogPost}>
          <section className={clss.blogPost__section}>
            {title && <h1 className={clss.blogPost__title}>{title}</h1>}
          </section>

          <section className={clss.blogPost__section}>
            {image &&
              <Image className={clss.blogPost__image} src={image} alt='' width={930} height={532} loading='lazy' />
            }
          </section>

          <section className={clss.blogPost__section}>
            <div className={`${clss.blogPost__content} htmlContent`} dangerouslySetInnerHTML={{ __html: cleanContent }} />
          </section>
        </article>
      </div>

      <section className={clss.formContainer}>
        <Suspense fallback={null}>
          <MainForm />
        </Suspense>
      </section>
    </>
  );
}