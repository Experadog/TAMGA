import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "storage.yandexcloud.net",
                pathname: "/**",
            },
        ],
    },
};

export default withNextIntl(nextConfig);
