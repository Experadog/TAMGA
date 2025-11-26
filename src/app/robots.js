const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // если что-то нужно закрыть — сюда можно добавить disallow
        // disallow: ['/admin', '/some-private-page'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}