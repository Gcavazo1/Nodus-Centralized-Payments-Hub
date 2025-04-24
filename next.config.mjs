/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add other Next.js configurations here as needed
  // Example: images configuration
  images: {
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'example.com',
    //     port: '',
    //     pathname: '/images/**',
    //   },
    // ],
  },
  // Experimental features can be enabled here
  // experimental: {
  //   serverActions: true,
  // },
  
  // Add headers configuration for Content Security Policy
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://*.coinbase.com https://js.stripe.com https://applepay.cdn-apple.com https://firebase.googleapis.com https://*.firebaseio.com; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://applepay.cdn-apple.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data: https://*.stripe.com https://*.google.com https://www.gstatic.com https://*.googleapis.com; " +
              "frame-src 'self' https://*.stripe.com https://*.coinbase.com https://*.firebase.com https://*.firebaseio.com; " +
              "connect-src 'self' https://*.stripe.com https://*.coinbase.com https://*.googleapis.com https://firestore.googleapis.com https://*.firebase.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com https://*.gstatic.com;"
          }
        ]
      }
    ];
  },
  
  // Explicitly set environment variables
  env: {
    // Stripe Keys
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    
    // Coinbase Keys
    COINBASE_COMMERCE_API_KEY: process.env.COINBASE_COMMERCE_API_KEY,
    COINBASE_COMMERCE_WEBHOOK_SECRET: process.env.COINBASE_COMMERCE_WEBHOOK_SECRET,
  },
};

export default nextConfig; 