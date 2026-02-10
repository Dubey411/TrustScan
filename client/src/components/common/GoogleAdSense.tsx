import Script from 'next/script';

const GoogleAdSense = () => {
    // 1. Register at: https://adsense.google.com/start/
    // 2. Get your "Publisher ID" (e.g., ca-pub-1234567890123456)
    // 3. Paste it inside the quotes below:
    const PUBLISHER_ID = ''; 

    if (!PUBLISHER_ID) return null;

    return (
        <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
};

export default GoogleAdSense;
