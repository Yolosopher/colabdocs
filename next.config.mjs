/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                hostname: "img.clerk.com",
            },
        ],
    },
};

export default nextConfig;
