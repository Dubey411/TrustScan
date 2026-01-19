import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { runRules } from '../services/rulesEngine.js';
import Scan from '../models/Scan.js';
import connectDB from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Ingests a CSV dataset (e.g., Kaggle SMS Spam Collection)
 * Maps raw text -> Rules Engine (Signals) -> MongoDB (Ground Truth)
 */
async function importDataset(filePath) {
    console.log(`🚀 [Data Ingest] Starting import from: ${filePath}`);
    
    try {
        await connectDB();
        
        // 0. Clear previous imports from the same source to avoid stale data
        const sourceName = filePath.includes('spam.csv') ? 'kaggle_spam' : 'indian_fraud_dataset';
        const deleted = await Scan.deleteMany({ source: sourceName });
        console.log(`🧹 [Data Ingest] Cleared ${deleted.deletedCount} existing records for source: ${sourceName}`);

        const results = [];
        let count = 0;
        let skipped = 0;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // 1. Data Mapping
                // Use nullish coalescing ?? or check for existence to avoid '0' being skipped
                let label = row.v1 ?? row.label ?? row.Category ?? row.target ?? row.is_fraudulent;
                let text = row.v2 ?? row.text ?? row.Message ?? row.content;
                const type = row.type || (row.amount ? 'transaction' : 'message');

                // If text is missing but transactional data exists, create a "Synthetic Description"
                if (!text && (row.amount || row.purchase_category)) {
                    // We only include the 'Type' (fraud_type) if we want the model to learn localized keywords
                    // But we keep it on both Safe and Fraud rows so the model learns it's not a 100% indicator
                    text = `Transaction Alert: ${row.purchase_category || 'Purchase'} of Rs. ${row.amount || '0'} at ${row.location || 'India'}. Segment: ${row.fraud_type || 'General'}`;
                }

                if (text === undefined || label === undefined) {
                    skipped++;
                    return;
                }


                // 2. Process text through Rules Engine to extract Feature Signals
                const analysis = runRules(text);


                // 3. Map label to userFeedback (Ground Truth)
                const isFraud = ['spam', 'fraud', 'scam', '1', 'risky', '1.0'].includes(String(label).toLowerCase());
                
                // Determine source name from filePath for better tracking
                const sourceName = filePath.includes('spam.csv') ? 'kaggle_spam' : 'indian_fraud_dataset';

                results.push({
                    content: text,
                    type: type,
                    status: isFraud ? 'fraud' : 'safe',
                    riskScore: analysis.riskScore,
                    signals: analysis.signals,
                    metadata: analysis.metadata,
                    rulesFired: analysis.rulesFired,
                    userFeedback: 'correct', 
                    source: sourceName,
                    createdAt: new Date()
                });


                count++;
                if (count % 100 === 0) console.log(`⏳ Processed ${count} rows...`);
            })
            .on('end', async () => {
                console.log(`📥 [Data Ingest] Processing complete. Inserting ${results.length} records into MongoDB...`);
                
                // Batch insert for performance
                const batchSize = 500;
                for (let i = 0; i < results.length; i += batchSize) {
                    const batch = results.slice(i, i + batchSize);
                    await Scan.insertMany(batch);
                }

                console.log(`✅ [Data Ingest] Successfully imported ${results.length} samples.`);
                console.log(`⚠️ [Data Ingest] Skipped ${skipped} invalid rows.`);
                
                mongoose.connection.close();
                process.exit(0);
            });

    } catch (err) {
        console.error('❌ [Data Ingest] Critical Failure:', err);
        process.exit(1);
    }
}

// CLI usage
const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Usage: node importDataset.js <path_to_csv>');
    process.exit(1);
}

importDataset(args[0]);
