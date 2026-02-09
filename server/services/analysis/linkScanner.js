import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Extended Trusted List
const TRUSTED_DOMAINS = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'trustedDomains.json'), 'utf8')
);

// Load Known Scam Database (Blacklist)
let SCAM_LINKS = [];
try {
    SCAM_LINKS = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'scamLinks.json'), 'utf8')
    );
} catch (e) {
    console.warn("⚠️ Scam Links Database missing or empty.");
}

const SUSPICIOUS_TLDS = [
  '.top', '.xyz', '.gl', '.icu', '.club', '.work', 
  '.biz', '.info', '.best', '.online', '.site', 
  '.cc', '.ws', '.to', '.click', '.link', '.today', '.zip', '.mov'
];

/**
 * Live Link Metadata Scraper
 * Extracts Title and Meta Tags to verify site content context.
 */
async function fetchMetadata(url) {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 6000); 

        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 
                'User-Agent': 'TrustScan-SecurityBot/1.2',
                'Accept': 'text/html'
            }
        });
        clearTimeout(id);

        const html = await response.text();
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const descMatch = html.match(/<meta name="description" content="(.*?)"/i);
        
        // --- Curiosity-Driven Data Points ---
        const hasLoginForm = /type=["']password["']|name=["']password["']/i.test(html);
        const isWorldPress = html.includes('wp-content') || html.includes('wp-includes');
        const isWix = html.includes('wix.com') || html.includes('static.wixstatic');
        
        // Extract a few visible emails or phones as "Contact Footprints"
        const emails = (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).slice(0, 2);
        const phones = (html.match(/(\+?\d{1,3}[- ]?)?\d{10}/g) || []).slice(0, 2);

        return {
            title: titleMatch ? titleMatch[1].trim() : "",
            description: descMatch ? descMatch[1].trim() : "",
            status: response.status,
            curiosityTags: {
                hasLoginForm,
                platform: isWorldPress ? 'WordPress' : (isWix ? 'Wix' : 'Custom/Other'),
                contactFootprint: [...new Set([...emails, ...phones])]
            }
        };
    } catch (err) {
        return null; 
    }
}

const isShortener = (host) => {
  const shorteners = [
    'bit.ly', 't.co', 'goo.gl', 'tinyurl.com', 'is.gd', 'buff.ly', 'adf.ly', 'bit.do', 'mcaf.ee', 'su.pr',
    'ow.ly', 'rebrandly.com', 'tiny.cc', 'shorte.st', 'cutt.ly', 'linktree', 'sendibm1.com', 'sendibm2.com',
    'sendibm3.com', 'sendibm4.com', 'brevo.com', 'forms.gle', 't.me', 'wa.me'
  ];
  return shorteners.some(s => host === s || host.endsWith('.' + s));
};

/**
 * Resolves redirect chains to find the final destination.
 */
async function resolveRedirects(url) {
  const chain = [];
  let currentUrl = url;
  let attempts = 0;
  const maxRedirects = 5;

  try {
    while (attempts < maxRedirects) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000); 

      // Attempt HEAD first, fallback to GET (manual redirect handling)
      let response;
      try {
          response = await fetch(currentUrl, {
            method: 'HEAD',
            redirect: 'manual',
            headers: { 'User-Agent': 'TrustScan-LinkBot/1.1' },
            signal: controller.signal
          });
      } catch (e) {
          // If HEAD fails (some servers block it), attempt a small GET
          response = await fetch(currentUrl, {
            method: 'GET',
            redirect: 'manual',
            headers: { 'Range': 'bytes=0-0', 'User-Agent': 'TrustScan-LinkBot/1.1' },
            signal: controller.signal
          });
      }
      clearTimeout(id);

      if (response.status >= 300 && response.status < 400) {
        const nextLoc = response.headers.get('location');
        if (nextLoc) {
          const resolvedNext = new URL(nextLoc, currentUrl).href;
          if (chain.includes(resolvedNext)) break; // Detect circular redirects
          chain.push(resolvedNext);
          currentUrl = resolvedNext;
          attempts++;
        } else {
          break;
        }
      } else {
        break; 
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

  // Refined extraction: 
  // 1. Must (have protocol/www) OR 
  // 2. Must (use known TLD) OR
  // 3. Must (be a modern deployment subdomain)
  const urlRegex = /(?:https?:\/\/|www\.)[\w\-]+\.[a-z]{2,12}(\/.*)?|[\w\-]+\.(com|net|org|in|co|io|ly|ai|me|info|biz|site|online|top|xyz|gov|ac|edu|ru|ua|tw|cn|uk|pk|jp|de|fr|br|ca|au|us|app|dev|page|link)\b|\b[\w\-]+\.(vercel\.app|github\.io|netlify\.app|pages\.dev|web\.app|firebaseapp\.com)\b/gi;
  const rawUrls = text.match(urlRegex) || [];
  
  const signals = {
    suspiciousTld: 0,
    typosquatting: 0,
    shortenerObfuscation: 0,
    ipHost: 0,
    trustedDomain: 0,
    punycodeHomograph: 0,
    subdomainAbuse: 0,
    pathObfuscation: 0,
    pathObfuscation: 0,
    contentMismatch: 0, // New Signal
    knownScamLink: 0    // New Signal (Blacklist)
  };

  const detectedLinks = [];

  await Promise.all(rawUrls.map(async (url) => {
    try {
      let normalizedUrl = url.toLowerCase();
      if (!normalizedUrl.startsWith('http')) normalizedUrl = 'http://' + normalizedUrl;
      
      const urlObj = new URL(normalizedUrl);
      const host = urlObj.hostname;
      
      const getBrandName = (h) => {
          const p = h.split('.');
          if (p.length >= 2) {
              if (p.length >= 3 && p[p.length-2].length <= 3 && (p[p.length-2].match(/^(com|co|org|net|gov|edu|res|in|ac)$/) || p[p.length-1].length <= 2)) {
                  return p[p.length-3];
              }
              return p[p.length-2];
          }
          return h;
      };
      
      const currentBrand = getBrandName(host);

      const linkAnalysis = {
          url: url,
          host: host,
          flags: [],
          redirectChain: null,
          finalDestination: null,
          liveMetadata: null
      };

      // 1. Trusted Domain Check
      if (TRUSTED_DOMAINS.some(td => host === td.domain || host.endsWith('.' + td.domain))) {
          signals.trustedDomain = 1;
      }

      // 1b. Known Scam Database Check (Blacklist)
      if (SCAM_LINKS.includes(host) || SCAM_LINKS.some(sl => host.endsWith('.' + sl))) {
          signals.knownScamLink = 1;
          linkAnalysis.flags.push('KNOWN_SCAM_DATABASE');
      }

      // 2. LIVE METADATA SCAN (Catch Mismatched Content)
      const meta = await fetchMetadata(normalizedUrl);
      if (meta) {
          linkAnalysis.liveMetadata = meta;
          // Check if Title contains a major brand that is NOT the current host
          const suspiciousBrand = ["facebook", "amazon", "apple", "netflix", "google", "bank", "sbi", "paytm"].find(b => 
            meta.title.toLowerCase().includes(b) && !host.includes(b)
          );
          if (suspiciousBrand) {
             signals.contentMismatch = 1;
             linkAnalysis.flags.push('BRAND_CONTENT_MISMATCH');
          }
      }

      // 3. Punycode / Homograph Attack Detection
      if (host.includes('xn--')) {
          signals.punycodeHomograph = 1;
          linkAnalysis.flags.push('HOMOGRAPH_ATTACK');
      }

      // 4. Subdomain Depth Abuse
      const parts = host.split('.');
      if (parts.length > 4) {
          signals.subdomainAbuse = 1;
          linkAnalysis.flags.push('EXCESSIVE_SUBDOMAINS');
      }

      // 5. IP Host Check
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
        signals.ipHost = 1;
        linkAnalysis.flags.push('IP_HOST');
      }

      // 6. Path Obfuscation (@ trick, etc.)
      if (url.includes('@') && !url.startsWith('mailto:')) {
          signals.pathObfuscation = 1;
          linkAnalysis.flags.push('CREDENTIAL_OR_PATH_OBFUSCATION');
      }

      // 7. Suspicious TLDs
      if (SUSPICIOUS_TLDS.some(tld => host.endsWith(tld))) {
        signals.suspiciousTld = 1;
        linkAnalysis.flags.push('SUSPICIOUS_TLD');
      }

      // 8. Typosquatting (Against Expanded List)
      TRUSTED_DOMAINS.forEach(trusted => {
        const trustedBrand = getBrandName(trusted.domain);
        const distance = levenshteinDistance(currentBrand, trustedBrand);
        if (distance > 0 && distance <= 2 && currentBrand.length > 3) {
           signals.typosquatting = 1;
           linkAnalysis.flags.push('TYPOSQUATTING');
        }
      });

      // 9. Shortener Resolution
      if (isShortener(host)) {
        signals.shortenerObfuscation = 1;
        linkAnalysis.flags.push('SHORTENER');
        
        const { finalUrl, chain } = await resolveRedirects(normalizedUrl);
        if (chain.length > 0) {
            linkAnalysis.redirectChain = chain;
            linkAnalysis.finalDestination = finalUrl;
            
            const finalHost = new URL(finalUrl).hostname;
            if (SUSPICIOUS_TLDS.some(tld => finalHost.endsWith(tld))) {
                 signals.suspiciousTld = 1;
                 linkAnalysis.flags.push('DANGEROUS_REDIRECT_TARGET');
            }
        }
      }

      detectedLinks.push(linkAnalysis);
    } catch (e) {
      // Skip invalid quietly
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
  const m = s.length, n = t.length;
  const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      if (s[i - 1] === t[j - 1]) d[i][j] = d[i - 1][j - 1];
      else d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1);
    }
  }
  return d[m][n];
}
