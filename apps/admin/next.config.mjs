/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: [
    'staging-mfoni.s3.us-east-1.amazonaws.com'
        ]}
};

export default nextConfig;
