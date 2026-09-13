import Script from 'next/script';

const GoogleAdSense = () => {
  const clientPublisherId =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-5575657922634928';

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
