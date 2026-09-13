import Script from 'next/script';

const GoogleAdSense = () => {
  // Option A: Set NEXT_PUBLIC_ADSENSE_CLIENT_ID in .env.local or production host
  // Option B: Paste your ID below (e.g. 'ca-pub-1234567890123456')
  const clientPublisherId =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';

  if (!clientPublisherId) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientPublisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default GoogleAdSense;
