export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  content: string[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'how-to-spot-fake-tcs-infosys-offer-letter',
    title: 'How to Spot a Fake TCS or Infosys Offer Letter in 2026: The Complete Guide',
    excerpt: 'Indian IT giants like TCS, Infosys, and Wipro never charge training or onboarding fees. Learn the 5 forensic markers that expose forged recruitment documents.',
    category: 'Offer Letter Security',
    readTime: '6 min read',
    date: 'September 2026',
    author: 'Shubham Dubey',
    content: [
      'Every campus placement season in India, over 100,000 final-year engineering and BCA/MCA students receive counterfeit appointment letters purporting to be from Tata Consultancy Services (TCS), Infosys, Wipro, and Cognizant.',
      'The core motive behind these fraudulent letters is simple: to extract "mandatory laptop deposits", "medical examination charges", or "training portal activation fees" ranging from ₹1,500 to ₹15,000 before the candidate realizes they have been scammed.',
      '### 1. The Zero-Fee Corporate Policy',
      'Both TCS and Infosys have established strict, zero-tolerance public notices regarding recruitment fees. Legitimate corporate entities in India NEVER ask selected candidates to pay for security deposits, aptitude tests, or orientation kits. Any letter demanding payment—under any pretext—is 100% fraudulent.',
      '### 2. Email Domain Authenticity',
      'Official communications from Tata Consultancy Services originate strictly from `@tcs.com` or through their official career portal (`nextstep.tcs.com`). If an email originates from "@tcs-careers.org", "@tcs-hiring.xyz", or free webmail services like "@gmail.com", the communication is an engineered phishing attempt.',
      '### 3. Verification of Corporate Identification Numbers (CIN)',
      'Every genuine corporate offer letter quotes a 21-digit alphanumeric CIN. Scammers often fabricate random strings or copy the CIN of a totally unrelated firm. Cross-reference the CIN on the Ministry of Corporate Affairs (MCA) database to confirm company status.',
      '### 4. Visual Heuristics & Forged Seals',
      'Counterfeit letters often feature pixelated blue ink stamps, misaligned corporate logos with compression artifacts, and generic cut-and-pasted signatures. TrustScan AI scans these artifacts in milliseconds using Error Level Analysis (ELA) to compute stamp tampering confidence scores.'
    ]
  },
  {
    slug: 'anatomy-of-telegram-task-scams-india',
    title: 'The Anatomy of Telegram & WhatsApp Part-Time Task Scams in India',
    excerpt: 'A psychological and technical breakdown of how cyber syndicates lure victims with ₹200 YouTube rating tasks before draining thousands through synthetic crypto wallets.',
    category: 'Cyber Fraud Intelligence',
    readTime: '7 min read',
    date: 'September 2026',
    author: 'Shubham Dubey',
    content: [
      'Task fraud represents one of the most prolific cyber-criminal enterprises operating across India. In 2025 and 2026, thousands of crore rupees were siphoned from students, homemakers, and remote workers.',
      '### Stage 1: The WhatsApp Cold Ping',
      'The attack begins with an unsolicited message from a foreign or virtual phone number: "Hello! We are offering part-time flexible remote work. You can earn ₹2,000 to ₹5,000 daily by simply reviewing Google Maps locations or rating YouTube videos."',
      '### Stage 2: The Bait Payment',
      'To build immediate trust, the victim is asked to complete 3 trivial tasks (such as screenshotting a liked video). Within 10 minutes, the handler transfers ₹150 to ₹300 directly via UPI to the victim’s account. This creates false legitimacy.',
      '### Stage 3: The VIP Prepaid Trap',
      'The victim is subsequently invited into a Telegram channel with dozens of participants (mostly automated bots posting fake bank credits). The handler introduces "VIP Merchant Tasks", requiring a deposit of ₹3,000 to generate a ₹6,000 return.',
      '### Stage 4: Freezing & Extortion',
      'Once a victim transfers large sums (₹50,000+), the simulated balance on the fraudulent web dashboard is frozen. The scammer demands an additional 30% "processing fee" or "income tax clearance" before funds can be withdrawn. The money is immediately laundered through mule bank accounts.'
    ]
  },
  {
    slug: 'how-scammers-make-fake-upi-screenshots',
    title: 'How Scammers Create Fake UPI Screenshots (Paytm & GPay Spoof APKs)',
    excerpt: 'Shopkeepers and merchants across India are being targeted with spoof payment APKs. Here is how fake payment screenshots are created and how to verify them.',
    category: 'Payment Forensics',
    readTime: '5 min read',
    date: 'August 2026',
    author: 'Shubham Dubey',
    content: [
      'Digital payments through the Unified Payments Interface (UPI) process billions of transactions monthly in India. With rapid adoption, cybercriminals developed modified Android application packages (APKs) commonly termed "Spoof Paytm" or "FakePay".',
      '### How Spoof APKs Function',
      'These illicit apps replicate the exact visual user interface of Paytm, Google Pay, and PhonePe. A fraudster enters the merchant\'s name, phone number, and transaction amount. Upon tapping "Pay", the app plays the identical green confirmation tick animation and sound effect without ever initiating a bank transfer.',
      '### Top 3 Visual Flaws to Spot Fake Screenshots',
      '1. **Font & Kerning Inconsistencies:** Genuine payment apps use custom typography. Spoof APKs use generic system fonts, leading to unaligned rupee symbols (`₹`) and uneven spacing.',
      '2. **Battery & Status Bar Conflicts:** If the customer is holding a Samsung phone but the screenshot displays an iOS status bar or battery percentage icon, it is an obvious static counterfeit.',
      '3. **12-Digit UTR Mathematical Check:** Genuine UPI transactions issue a 12-digit sequential UTR where the first digits correspond to the Julian date of the transaction. Fake APKs generate random digits that fail NPCI date validation.',
      '### The Merchant Rule',
      'Never hand over merchandise based on a buyer\'s phone display. Always verify receipt through your Soundbox audio confirmation or the transaction history in your own merchant terminal.'
    ]
  },
  {
    slug: 'how-to-verify-company-cin-on-mca-portal',
    title: 'How to Verify an Indian Company on the Ministry of Corporate Affairs (MCA) Portal',
    excerpt: 'Step-by-step guide to decoding 21-digit Corporate Identity Numbers (CIN) and inspecting registration status on mca.gov.in before joining or investing.',
    category: 'Corporate Verification',
    readTime: '6 min read',
    date: 'August 2026',
    author: 'Shubham Dubey',
    content: [
      'When evaluating a prospective employer or business partner in India, the most reliable government record is the Ministry of Corporate Affairs (MCA) database.',
      '### The Structure of an Indian CIN',
      'A 21-digit Corporate Identification Number contains 6 distinct metadata fields:',
      '- **Digit 1 (Listing Status):** `L` indicates publicly listed on stock exchanges; `U` indicates unlisted.',
      '- **Digits 2-6 (NIC Industry Code):** The 5-digit National Industrial Classification code.',
      '- **Digits 7-8 (State Code):** The 2-letter state abbreviation of the Registrar of Companies (e.g. `MH` for Maharashtra, `KA` for Karnataka).',
      '- **Digits 9-12 (Incorporation Year):** The 4-digit calendar year the company was registered.',
      '- **Digits 13-15 (Company Ownership):** `PTC` (Private Limited), `PLC` (Public Limited), or `GOI` (Government of India).',
      '- **Digits 16-21 (Sequence Number):** 6-digit unique registration number.',
      '### How to Inspect on MCA Portal',
      '1. Navigate to the official Ministry of Corporate Affairs portal at `https://www.mca.gov.in`.',
      '2. Go to **MCA Services** → **Master Data** → **View Company or LLP Master Data**.',
      '3. Enter the 21-digit CIN or exact Company Name.',
      '4. Review the company\'s current status: ensure it is marked as **Active**, not **Struck Off**, **Under Liquidation**, or **Amalgamated**.'
    ]
  },
  {
    slug: 'cybercrime-1930-golden-hour-reporting-guide',
    title: 'What to Do If You Lost Money to Cyber Fraud: The 1930 Helpline & Golden Hour Guide',
    excerpt: 'Actionable emergency protocol for citizens: How dialling 1930 within 2 hours enables the Indian Cyber Crime Coordination Centre (I4C) to freeze fraudulent transfers.',
    category: 'Citizen Safety',
    readTime: '5 min read',
    date: 'July 2026',
    author: 'Shubham Dubey',
    content: [
      'If you have transferred funds to an online scammer, every single minute determines whether your money can be recovered. The first two hours after a fraudulent transaction are known in cybersecurity law enforcement as the **"Golden Hour"**.',
      '### Step 1: Call 1930 Immediately',
      'The National Cyber Crime Helpline number **1930** (operated by the Indian Cyber Crime Coordination Centre - I4C under the Ministry of Home Affairs) is connected directly to major Indian public and private banks.',
      'When you dial 1930, provide:',
      '- Your debit bank account number and registered mobile number.',
      '- The transaction UTR or reference number.',
      '- The recipient\'s UPI ID, bank account, or wallet identifier.',
      '- The exact timestamp and amount deducted.',
      '### Step 2: The Citizen Financial Cyber Fraud Reporting System (CFCFRMS)',
      'Once your call is logged, the 1930 desk fires an automated notification to the recipient beneficiary bank to immediately place a debit freeze or lien on the suspected mule account before the fraudster can withdraw cash from an ATM.',
      '### Step 3: Formal Complaint on cybercrime.gov.in',
      'Within 24 hours of reporting on 1930, visit `https://cybercrime.gov.in` to convert your acknowledgement number into a formal cybercrime report. Attach screenshots of WhatsApp/Telegram conversations, offer letters, and transaction receipts.'
    ]
  }
];
