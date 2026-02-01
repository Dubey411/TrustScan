import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Scan from './models/Scan.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const stats = await Scan.aggregate([
            {
                $group: {
                    _id: { type: '$type', source: '$source' },
                    count: { $sum: 1 },
                    feedbackCount: { 
                        $sum: { $cond: [{ $ne: ['$userFeedback', null] }, 1, 0] } 
                    },
                    correctCount: {
                         $sum: { $cond: [{ $eq: ['$userFeedback', 'correct'] }, 1, 0] } 
                    }
                }
            }
        ]);

        console.log("Stats by Type and Source:");
        console.log(JSON.stringify(stats, null, 2));

        const totalFeedback = await Scan.countDocuments({ userFeedback: { $ne: null } });
        console.log("\nTotal documents with feedback:", totalFeedback);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
