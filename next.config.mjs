/** @type {import('next').NextConfig} */
export default nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                hostname: "img.clerk.com",
            },
        ],
    },
};
