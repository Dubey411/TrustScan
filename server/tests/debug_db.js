import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;

console.log('--- MongoDB Connection Debugger ---');
console.log('URI found:', uri ? 'Yes' : 'No');

if (!uri) {
    console.error('❌ MONGO_URI is missing from .env');
    process.exit(1);
}

const testConnection = async () => {
    // Attempt 1: Default
    try {
        console.log('\nAttempt 1: Standard Connection...');
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ Success! Host:', conn.connection.host);
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Attempt 1 Failed:', err.message);
        if (err.message.includes('ECONNRESET')) {
            console.log('💡 Tip: ECONNRESET often means the firewall or specialized network settings are blocking the connection.');
        }
    }

    // Attempt 2: Force IPv4
    try {
        console.log('\nAttempt 2: Forcing IPv4 (family: 4)...');
        const conn = await mongoose.connect(uri, {
            family: 4,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Success with IPv4! Host:', conn.connection.host);
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Attempt 2 Failed:', err.message);
    }

    // Attempt 3: No SRV (if URI allows)
    if (uri.startsWith('mongodb+srv')) {
        console.log('\nNote: You are using mongodb+srv. If your DNS is flaky, this can cause ECONNRESET.');
    }

    console.log('\n--- Debugging Complete ---');
    process.exit(0);
};

testConnection();
