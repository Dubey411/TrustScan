import express from "express";
import Scan from "../models/Scan.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * Get overall platform statistics
 */
router.get("/stats", async (req, res) => {
    try {
        const totalScans = await Scan.countDocuments();
        const registeredUsers = await User.countDocuments();
        const guestScans = await Scan.countDocuments({ $or: [{ userId: null }, { userId: { $exists: false } }] });
        
        // Distribution by scan type
        const typeStats = await Scan.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        // Distribution by status (Approved/Rejected by User Logic)
        const statusStats = await Scan.aggregate([
            {
                $project: {
                    effectiveStatus: {
                        $switch: {
                            branches: [
                                // User said "It's Safe" (overriding a fraud/suspicious verdict)
                                { case: { $eq: ["$userFeedback", "incorrect_safe"] }, then: "safe" },
                                // User said "It's Fraud" (overriding a safe verdict)
                                { case: { $eq: ["$userFeedback", "incorrect_fraud"] }, then: "fraud" }
                            ],
                            default: "$status"
                        }
                    }
                }
            },
            { $group: { _id: "$effectiveStatus", count: { $sum: 1 } } }
        ]);

        res.json({
            totalScans,
            totalUsers: registeredUsers, // Keep for backward compatibility
            registeredUsers,
            guestScans,
            typeStats: typeStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
            statusStats: statusStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch admin stats" });
    }
});

/**
 * Get daily growth data for charts (Last 15 days)
 */
router.get("/chart-data", async (req, res) => {
    try {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const dailyStats = await Scan.aggregate([
            {
                $match: {
                    createdAt: { $gte: fifteenDaysAgo }
                }
            },
            {
                $project: {
                    createdAt: 1,
                    isThreat: {
                        $switch: {
                            branches: [
                                // Force TRUE if user reported it as missed fraud
                                { case: { $eq: ["$userFeedback", "incorrect_fraud"] }, then: true },
                                // Force FALSE if user reported it as false alarm
                                { case: { $eq: ["$userFeedback", "incorrect_safe"] }, then: false }
                            ],
                            // Default: Check original status
                            default: { $in: ["$status", ["fraud", "scam"]] }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: { 
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
                    },
                    count: { $sum: 1 },
                    threats: { 
                        $sum: { $cond: ["$isThreat", 1, 0] } 
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json(dailyStats);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch chart data" });
    }
});

export default router;
