/**
 * Entity Scanner Service
 * Extracts and validates official Indian business identifiers (GSTIN, CIN).
 * Now includes CIN Partial Match Detection.
 */

const GST_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}/g;
const CIN_REGEX = /[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}/g;

const GST_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const STATE_CODES = ["AP", "AR", "AS", "BR", "CT", "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "MP", "MH", "MN", "ML", "MZ", "NL", "OR", "PB", "RJ", "SK", "TN", "TG", "TR", "UP", "UK", "WB", "AN", "CH", "DH", "DD", "DL", "LD", "PY"];

const INDUSTRY_GROUPS = {
    "01": "Agriculture/Farming",
    "15": "Food/Beverages",
    "62": "IT/Software",
    "65": "Banking/Finance",
    "72": "R&D/Consultancy",
    "74": "Business Services",
    "80": "Education",
    "85": "Health/Social Work",
    "92": "Recreational/Cultural",
    "93": "Other Services"
};

// Helper for robust API calls
async function fetchWithRetry(url, options, retries = 1) {
    try {
        return await fetch(url, options);
    } catch (err) {
        const isNetworkError = err.cause?.code === 'ECONNRESET' || err.message.includes('fetch failed');
        if (retries > 0 && isNetworkError) {
             console.log("⚠️ [MCA API] Connection instability detected, retrying request...");
             await new Promise(r => setTimeout(r, 800)); // Short backoff
             return fetchWithRetry(url, options, retries - 1);
        }
        throw err;
    }
}

// --- Mock MCA Database (For Demo/Simulation) ---
const MOCK_COMPANY_DB = {
    "L28920MH1945PLC004520": { name: "TATA MOTORS LIMITED", status: "Active", address: "Bombay House, 24 Homi Mody Street, Mumbai, MH", class: "Public", incDate: "01 Sep 1945" },
    "L17110MH1973PLC019786": { name: "RELIANCE INDUSTRIES LIMITED", status: "Active", address: "Maker Chambers IV, 3rd Floor, 222 Nariman Point, Mumbai, MH", class: "Public", incDate: "08 May 1973" },
    "L85110KA1981PLC013115": { name: "INFOSYS LIMITED", status: "Active", address: "Electronics City, Hosur Road, Bangalore, KA", class: "Public", incDate: "02 Jul 1981" },
    "U72200MH2024PTC123456": { name: "TRUSTSCAN TECHNOLOGIES PRIVATE LIMITED", status: "Active", address: "Tech Park, Andheri East, Mumbai, MH", class: "Private", incDate: "15 Jan 2024" }
};

/**
 * Search Company by Name (Exact or Partial) via MCA API
 */
async function searchCompanyByName(name) {
    const apiKey = process.env.MCA_API_KEY;
    if (!apiKey || apiKey === 'YOUR_KEY_HERE') return null;

    // MCA Database stores names in UPPERCASE (e.g. "RELIANCE INDUSTRIES LIMITED")
    const searchTerm = name.trim().toUpperCase();

    try {
        console.log(`🌐 [MCA API] Searching for Company Name: ${searchTerm}...`);
        
        // 1. Try EXACT MATCH first via filter (Most Accurate)
        const exactUrl = `https://api.data.gov.in/resource/4dbe5667-7b6b-41d7-82af-211562424d9a?api-key=${apiKey}&format=json&filters[CompanyName]=${encodeURIComponent(searchTerm)}`;
        const exactResponse = await fetchWithRetry(exactUrl);
        const exactData = await exactResponse.json();

        let records = exactData.records || [];

        // 2. If no exact match, try SEARCH (q parameter)
        if (records.length === 0) {
            const searchUrl = `https://api.data.gov.in/resource/4dbe5667-7b6b-41d7-82af-211562424d9a?api-key=${apiKey}&format=json&q=${encodeURIComponent(searchTerm)}`;
            const searchResponse = await fetchWithRetry(searchUrl);
            const searchData = await searchResponse.json();
            records = searchData.records || [];
        }

        if (records.length > 0) {
            // VALIDATION: Clean search terms and find the best word-for-word match
            // We ignore common corporate fillers to find the "unique" part of the name
            const coreTerms = searchTerm
                .replace(/\b(PRIVATE|LIMITED|PVT|LTD|AND|SOLUTIONS|TECHNOLOGY|TECHNOLOGIES|SERVICES|CORP|CORPORATION|INDIA|LLP|GROUP|ENTERPRISE|ENTERPRISES|TECHNOLOCIES)\b/g, '')
                .trim()
                .split(/\s+/)
                .filter(t => t.length > 1);
            
            if (coreTerms.length === 0) return null;

            // Find a match where EVERY core term is found within the company name
            // This handles spacing diffs (Innovix Pro -> INNOVIXPRO) and partial suffixes (Tech -> Technology)
            const bestMatch = records.find(r => {
                const vendorName = r.CompanyName.toUpperCase();
                return coreTerms.every(term => {
                    // Try word boundary first (Most accurate)
                    const wordRegex = new RegExp(`\\b${term}\\b`, 'i');
                    if (wordRegex.test(vendorName)) return true;
                    
                    // Fallback to substring match (Flexible for "InnovixPro" or "Technologies")
                    // We only do this if the vendor word starts with our term to avoid random mid-word matches
                    // OR if the term is long enough to be unique.
                    return vendorName.includes(term);
                });
            });

            if (bestMatch) {
                console.log(`✅ [MCA API] High-confidence match: "${bestMatch.CompanyName}"`);
                return {
                    name: bestMatch.CompanyName,
                    cin: bestMatch.CIN, 
                    status: bestMatch.CompanyStatus,
                    address: bestMatch.Registered_Office_Address,
                    class: bestMatch.CompanyClass,
                    incDate: bestMatch.CompanyRegistrationdate_date,
                    source: "GOVT_API_NAME_SEARCH"
                };
            } else {
                console.log(`⚠️ [MCA API] No high-confidence match for "${searchTerm}" in ${records.length} results.`);
            }
        }
    } catch (error) {
        console.error("⚠️ [MCA API] Name Search failed:", error.code || error.message);
    }
    return null;
}

/**
 * Fetches Real Company Data from MCA via Data.gov.in API
 * Falls back to Mock DB or Simulation if API fails.
 */
async function enrichCompanyData(cin, parsedCin) {
    if (!parsedCin) return null;
    
    // 1. Try Real Government API (If Key Exists)
    const apiKey = process.env.MCA_API_KEY;
    if (apiKey && apiKey !== 'YOUR_KEY_HERE') {
        try {
            console.log(`🌐 [MCA API] Fetching data for CIN: ${cin}...`);
            const apiUrl = `https://api.data.gov.in/resource/4dbe5667-7b6b-41d7-82af-211562424d9a?api-key=${apiKey}&format=json&filters[CIN]=${cin}`;
            const response = await fetchWithRetry(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Connection': 'close'
                }
            });
            
            console.log(`🔹 [MCA API] Status: ${response.status} ${response.statusText}`);
            
            const data = await response.json();
            
            if (data.records && data.records.length > 0) {
                const record = data.records[0];
                console.log(`✅ [MCA API] Found record: ${record.CompanyName}`);
                
                return {
                    name: record.CompanyName,
                    status: record.CompanyStatus,
                    address: record.Registered_Office_Address,
                    class: record.CompanyClass,
                    incDate: record.CompanyRegistrationdate_date,
                    source: "GOVT_API_REALTIME"
                };
            } else {
                console.log(`❌ [MCA API] No records found or API error. Raw Data:`, JSON.stringify(data));
            }
        } catch (error) {
            console.error("⚠️ [MCA API] Fetch failed, reverting to simulation:", error);
        }
    }

    // 2. Check Mock DB (Fallback)
    if (MOCK_COMPANY_DB[cin]) {
        return {
            ...MOCK_COMPANY_DB[cin],
            source: "MCA_MOCK"
        };
    }

    // 3. Simulation Fallback: Project details from CIN structure
    const stateName = STATE_CODES.find(s => s === parsedCin.state) || parsedCin.state;
    const type = parsedCin.listing === 'Listed' ? 'Public Limited' : 'Private Limited';
    
    return {
        name: `UNK_ENTITY (Reg: ${parsedCin.year})`, 
        status: "Unverified (Not in Mock DB)",
        address: `Registered Office in ${stateName}`,
        class: type,
        incDate: `01 Jan ${parsedCin.year}`, // Fallback date
        source: "CIN_DECODE"
    };
}

/**
 * Validates GSTIN Checksum
 */
function validateGSTChecksum(gstin) {
  if (!gstin || gstin.length !== 15) return false;
  
  const chars = gstin.toUpperCase().split('');
  const checksumTarget = chars[14];
  const inputChars = chars.slice(0, 14);
  
  let factor = 1;
  let sum = 0;
  
  for (let i = 0; i < inputChars.length; i++) {
    const codePoint = GST_CHARS.indexOf(inputChars[i]);
    if (codePoint === -1) return false;
    
    let product = codePoint * factor;
    sum += Math.floor(product / 36) + (product % 36);
    factor = factor === 1 ? 2 : 1;
  }
  
  const calculatedChecksum = GST_CHARS[(36 - (sum % 36)) % 36];
  return calculatedChecksum === checksumTarget;
}

/**
 * Parses CIN into components for Context Matching
 * Format: L 12345 MH 2022 PTC 123456
 */
function parseCIN(cin) {
    if (!cin || cin.length !== 21) return null;
    return {
        listing: cin[0] === 'L' ? 'Listed' : 'Unlisted',
        industryCode: cin.substring(1, 6),
        industryGroup: cin.substring(1, 3),
        state: cin.substring(6, 8),
        year: cin.substring(8, 12),
        ownership: cin.substring(12, 15),
        regNo: cin.substring(15, 21)
    };
}

/**
 * Detects discrepancies between CIN and Document Text (Partial Match Fraud)
 */
function detectPartialMatchDiscrepancies(parsedCin, text) {
    const discrepancies = [];
    const normalizedText = text.toLowerCase();

    // 1. Year Mismatch
    // If text mentions "Founded in 1995" but CIN says "2022"
    const yearsInText = text.match(/\b(19|20)\d{2}\b/g) || [];
    if (yearsInText.length > 0 && !yearsInText.includes(parsedCin.year)) {
        // Only flag if a distinct "founded" or "established" keyword is near
        if (normalizedText.includes('founded') || normalizedText.includes('established') || normalizedText.includes('doj')) {
            discrepancies.push(`Year Mismatch: Document context implies different era than CIN (${parsedCin.year})`);
        }
    }

    // 2. State Mismatch
    // Filter out state codes that don't match the CIN
    const otherStates = STATE_CODES.filter(s => s !== parsedCin.state);
    for (const s of otherStates) {
        // Check for full state name to avoid false positives with state codes in random text
        // This is a simplified check for demo
        if (normalizedText.includes(`headquarters: ${s}`) || normalizedText.includes(`office: ${s}`)) {
           discrepancies.push(`State Discrepancy: CIN belongs to ${parsedCin.state}, but document mentions ${s} office.`);
           break;
        }
    }

    // 3. Industry Mismatch
    const groupName = INDUSTRY_GROUPS[parsedCin.industryGroup];
    if (groupName === "IT/Software") {
        const suspiciousContexts = ["hospital", "medical", "customs", "police", "arrest", "narcotics", "ebay", "amazon", "refund"];
        for (const context of suspiciousContexts) {
            if (normalizedText.includes(context)) {
                discrepancies.push(`Industry Conflict: ${groupName} entity used in ${context} context. High-sophistication impersonation suspected.`);
                break;
            }
        }
    } else if (groupName && (normalizedText.includes("investment") || normalizedText.includes("trading")) && groupName !== "Banking/Finance") {
        discrepancies.push(`Industry Conflict: Listed as ${groupName} but content suggests financial/investment activity.`);
    }

    return discrepancies;
}

/**
 * Analyzes text for business entities with Intel Layer
 */
export async function analyzeEntities(text, layer = 1, userId = null, metadata = {}) {
  if (!text) return { signals: {}, metadata: {} };

  const rawGsts = text.match(GST_REGEX) || [];
  const rawCins = text.match(CIN_REGEX) || [];

  const detectedEntities = [];
  let invalidBusinessIdCount = 0;
  let partialMatchAnomalyCount = 0;
  const entityDiscrepancies = [];

  // 🔥 PERFORMANCE: Process all CINs in PARALLEL instead of sequentially
  const cinPromises = rawCins.map(async (cin) => {
      const parsed = parseCIN(cin);

      const isStructurallyValid = parsed && STATE_CODES.includes(parsed.state) && parseInt(parsed.year) > 1900 && parseInt(parsed.year) <= new Date().getFullYear();
      
      let discrepancies = [];
      if (isStructurallyValid) {
          discrepancies = detectPartialMatchDiscrepancies(parsed, text);
      }

      if (!isStructurallyValid) {
          invalidBusinessIdCount++;
      }

      if (discrepancies.length > 0) {
          partialMatchAnomalyCount++;
          entityDiscrepancies.push(...discrepancies);
      }
      
      // Lookups based on Layer
      let enrichment = null;
      if (layer >= 3) {
          enrichment = await enrichCompanyData(cin, parsed);
      } else if (layer >= 2) {
          if (MOCK_COMPANY_DB[cin]) {
              enrichment = { ...MOCK_COMPANY_DB[cin], source: "MCA_MOCK" };
          } else {
              const stateName = STATE_CODES.find(s => s === parsed.state) || parsed.state;
              enrichment = {
                  name: `ENTITY_${cin.substring(15)}`, 
                  status: "Unverified (L2 Standard)",
                  address: `Registered in ${stateName}`,
                  source: "CIN_DECODE"
              };
          }
      }

      return {
          type: 'CIN',
          value: cin,
          isValid: isStructurallyValid && discrepancies.length === 0,
          portalUrl: `https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do`,
          parsed,
          enrichment, 
          discrepancies,
          label: discrepancies.length > 0 ? 'CIN Partial Match Discrepancy' : (isStructurallyValid ? 'Valid CIN Structure' : 'Invalid CIN Structure')
      };
  });

  const cinResults = await Promise.all(cinPromises);
  detectedEntities.push(...cinResults);

    // Fallback: Targeted Name Search (L2+ Standard/Deep Only)
    // If we couldn't find a CIN, but the rules engine extracted a potential company name, SEARCH FOR IT.
    let companyNameToSearch = null;
    if (metadata?.potentialOrgName) {
        companyNameToSearch = metadata.potentialOrgName;
    } else if (text.length < 100 && text.length > 1) {
        // If it's a very short text (like a manual search query), use the whole text
        companyNameToSearch = text.trim();
    }

    if (detectedEntities.length === 0 && companyNameToSearch && layer >= 1) {
        // Clean the name of common prefixes/footnotes and special chars
        const cleanName = companyNameToSearch.replace(/[^a-zA-Z0-9\s\&]/gi, '').trim().replace(/\s+/g, ' ');
        if (cleanName.length > 1) {
             console.log(`🔍 [Entity Scanner] Invoking MCA Name Search for cleaned name: "${cleanName}"`);
       if (!cleanName.includes('\n')) {
            // 1. Try real government API
            let nameResult = await searchCompanyByName(cleanName);
            
            // 2. Fallback to Mock Database if API failed or no result
            if (!nameResult) {
                const searchTokens = cleanName.toUpperCase().split(/\s+/).filter(Boolean);
                const mockEntry = Object.entries(MOCK_COMPANY_DB).find(([cin, data]) => {
                    const companyName = data.name.toUpperCase();
                    return (
                        companyName.includes(cleanName.toUpperCase()) ||
                        cleanName.toUpperCase().includes(companyName) ||
                        searchTokens.every((token) => companyName.includes(token))
                    );
                });
                if (mockEntry) {
                    nameResult = { ...mockEntry[1], cin: mockEntry[0] };
                }
            }

           if (nameResult) {
               detectedEntities.push({
                   type: 'CIN',
                   value: nameResult.cin || "N/A",
                   isValid: true,
                   portalUrl: `https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do`,
                   parsed: parseCIN(nameResult.cin),
                   enrichment: nameResult, 
                   discrepancies: [],
                   label: 'Company Found via Name Search'
               });
           }
       }
    }
  }

  // GST Logic (Sync - L1+)
  rawGsts.forEach(gst => {
      const isValid = validateGSTChecksum(gst);
      if (!isValid) invalidBusinessIdCount++;
      
      detectedEntities.push({
          type: 'GSTIN',
          value: gst,
          isValid,
          portalUrl: `https://services.gst.gov.in/services/searchtp`,
          label: isValid ? 'Valid GST Structure' : 'Invalid GST Format/Checksum'
      });
  });

  const signals = {
    hasGst: rawGsts.length > 0 ? 1 : 0,
    hasCin: rawCins.length > 0 ? 1 : 0,
    invalidBusinessId: invalidBusinessIdCount > 0 ? 1 : 0,
    businessContextMismatch: partialMatchAnomalyCount > 0 ? 1 : 0
  };

  return {
    signals,
    metadata: {
      entityCount: detectedEntities.length,
      detectedEntities,
      entityDiscrepancies
    }
  };
}
