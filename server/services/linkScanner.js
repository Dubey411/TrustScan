/**
 * Link Scanner Service
 * Performs heuristic analysis on URLs to detect phishing and fraud patterns.
 */

const SUSPICIOUS_TLDS = [
  '.top', '.xyz', '.gl', '.icu', '.club', '.work', 
  '.biz', '.info', '.best', '.online', '.site', 
  '.cc', '.ws', '.to', '.click', '.link'
];

const isShortener = (host) => {
  const shorteners = [
    'bit.ly', 't.co', 'goo.gl', 'tinyurl.com', 'is.gd', 'buff.ly', 'adf.ly', 'bit.do', 'mcaf.ee', 'su.pr',
    'ow.ly', 'rebrandly.com', 'tiny.cc', 'shorte.st', 'cutt.ly', 'linktree', 'sendibm1.com', 'sendibm2.com',
    'sendibm3.com', 'sendibm4.com', 'brevo.com'
  ];
  return shorteners.some(s => host.endsWith(s));
};

const TRUSTED_DOMAINS = [
  'amazon.in', 'amazon.com', 'flipkart.com', 
  'paytm.com', 'sbi.co.in', 'onlinesbi.sbi',
  'hdfcbank.com', 'icicibank.com', 'axisbank.com',
  'google.com', 'microsoft.com', 'apple.com',
  'github.com', 'linkedin.com', 'facebook.com', 'twitter.com', 'x.com',
  'whatsapp.com', 'telegram.org', 'web.app', 'firebaseapp.com', 'razorpay.com', 'instamojo.com',
  'cybercrime.gov.in', 'uidai.gov.in', 'incometax.gov.in'
];

/**
 * Resolves redirect chains to find the final destination.
 * @param {string} url - The starting URL.
 * @returns {Promise<{finalUrl: string, chain: string[]}>}
 */
async function resolveRedirects(url) {
  const chain = [];
  let currentUrl = url;
  let attempts = 0;
  const maxRedirects = 5;

  try {
    while (attempts < maxRedirects) {
      // Use HTTP HEAD to check redirects without downloading body
      // Note: Some shorteners block HEAD, so fallback to GET might be needed, but HEAD is faster/safer first.
      // We use 'manual' redirect mode to intercept 3xx.
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000); // 3s timeout per hop

      const response = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        headers: { 'User-Agent': 'TrustScan-LinkBot/1.0' },
        signal: controller.signal
      });
      clearTimeout(id);

      if (response.status >= 300 && response.status < 400) {
        const nextLoc = response.headers.get('location');
        if (nextLoc) {
          chain.push(new URL(nextLoc, currentUrl).href); // Resolve relative to current
          currentUrl = chain[chain.length - 1];
          attempts++;
        } else {
          break; // Redirect status but no location?
        }
      } else {
        break; // Not a redirect (200, 404, etc.)
      }
    }
  } catch (err) {
    // console.warn("Redirect check failed:", err.message);
  }

  return { finalUrl: currentUrl, chain };
}

/**
 * Extracts URLs and performs heuristic analysis
 */
export async function analyzeLinks(text) {
  if (!text) return { signals: {}, metadata: {} };

  // 1. Robust URL extraction
  const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|in|edu|gov|io|ly|co|gl|top|xyz|icu|biz|info|site|online)\b/gi;
  const rawUrls = text.match(urlRegex) || [];
  
  const signals = {
    suspiciousTld: 0,
    typosquatting: 0,
    shortenerObfuscation: 0,
    structuralAnomalies: 0,
    ipHost: 0,
    trustedDomain: 0 // New signal
  };

  const detectedLinks = [];

  // Parallel processing of links
  await Promise.all(rawUrls.map(async (url) => {
    try {
      // Normalize URL for analysis
      let normalizedUrl = url.toLowerCase();
      if (!normalizedUrl.startsWith('http')) normalizedUrl = 'http://' + normalizedUrl;
      
      const urlObj = new URL(normalizedUrl);
      const host = urlObj.hostname;

      const linkAnalysis = {
          url: url,
          host: host,
          flags: [],
          redirectChain: null,
          finalDestination: null
      };

      // Check for trusted domain parity
      if (TRUSTED_DOMAINS.some(td => host === td || host.endsWith('.' + td))) {
          signals.trustedDomain = 1;
      }

      // Check for IP address as host
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
        signals.ipHost = 1;
        linkAnalysis.flags.push('IP_HOST');
      }

      // Check for Shorteners - DEEP DIVER TRIGGER
      const isShort = isShortener(host);
      if (isShort) {
        signals.shortenerObfuscation = 1;
        linkAnalysis.flags.push('SHORTENER');
        
        // --- 🕵️♂️ Deep Diver: Follow the white rabbit ---
        const { finalUrl, chain } = await resolveRedirects(normalizedUrl);
        if (chain.length > 0) {
            linkAnalysis.redirectChain = chain;
            linkAnalysis.finalDestination = finalUrl;
            
            // Analyze the FINAL destination too!
            const finalHost = new URL(finalUrl).hostname;
            if (SUSPICIOUS_TLDS.some(tld => finalHost.endsWith(tld))) {
                 signals.suspiciousTld = 1;
                 linkAnalysis.flags.push('SUSPICIOUS_TLD'); // Flag original link as bad if target is bad
            }
        }
      }

      // Check for Suspicious TLDs
      if (SUSPICIOUS_TLDS.some(tld => host.endsWith(tld))) {
        signals.suspiciousTld = 1;
        linkAnalysis.flags.push('SUSPICIOUS_TLD');
      }

      // Typosquatting Analysis
      TRUSTED_DOMAINS.forEach(trusted => {
        const distance = levenshteinDistance(host.split('.')[0], trusted.split('.')[0]);
        // If distance is small (1-2) but not 0 (exact match)
        if (distance > 0 && distance <= 2 && host.length > 3) {
           signals.typosquatting = 1;
           linkAnalysis.flags.push('TYPOSQUATTING');
        }
      });

      detectedLinks.push(linkAnalysis);
    } catch (e) {
      // console.warn("Link Scanner skip invalid URL:", url);
    }
  }));

  return {
    signals,
    metadata: {
      linkCount: rawUrls.length,
      detectedLinks
    }
  };
}

/**
 * Levenshtein distance implementation for typosquatting detection
 */
function levenshteinDistance(s, t) {
  if (!s || !t) return 99;
  const m = s.length;
  const n = t.length;
  const d = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      if (s[i - 1] === t[j - 1]) d[i][j] = d[i - 1][j - 1];
      else d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1);
    }
  }
  return d[m][n];
}
