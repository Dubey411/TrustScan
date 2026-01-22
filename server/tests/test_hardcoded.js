import vision from '@google-cloud/vision';
import crypto from 'crypto';

// The key exactly as it appears in the JSON, but as a clean JS string
const rawKey = `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3H/wi8LH8YGWP\nKfksOaRvXo27kSr4ka/MynGK6VWyWSAxed6Sw/9UYxxjoBzJIjU9sG+DLtgrvg9q\nviEKcJ3ys0w0oplrrGSWptynpBSrfYJyL7oSTGcxONksqu+vv3bkIlrXxrz5Ze5j\nHb6NVeEYKpr9BvpJDLreUeM/WQ6YJJi2hrmi4V/NkGHvmEzO2tIu9OXNy6d9Y8Lw\nu1Q55j3DpCjourty2DM95pzGa8beVslG8n7+2yS2w6NU9hhtDVw1TiQKGvPfF9oH\n+fO4eBlcBA6sxKp/Pva/XwiVDSzPCXwEwkvn7Y7mp+stMOvRQIg0yd09JVuaGeos\nrkXIBcfvAgMBAAECggEAPeKRvy8PPyZGe/ynx7HNJ5PRGv+CgZEeU3tgppyXCNgE\nwKOaO4f/7AE4cVSFFdW5H1lWPgNhK1sl86FAIjqPrhq4mJsQdOpD7gOC0yZok9Gs\n+TC21YM7Zk97WRSFPqPaJluTzpLLfw7a4mUFZdcNZDDVwseOYoxqREJxJRHQFErJ\nhWc5O/QhbyNwFD+y+n6COKvdmt3+zC68vm1Xhy+C4A5xPuY04baq7aZqfNW3yDII\nR2sxdstAK5ehhxkitKW2dZR2gYggkmWvkch8Msw9GMy4F4GA4EDIn+TQSPuGsB6b\nXUXkiDjwiGdUVSTmIzdiqS6wTUBdylx+dinVKH1eMQKBgQD+0by+0rPaA+pe/9Da\nMqYP9IC22iiCWh9kCa3mIypVRASYg8WG+e8px+y5Qz/1GqbMKwTZQa+7UHj4cwTS\nHGZjSEfUaQs4bXJcpSklzioiIotLSmAKxiCZVSqqLn8HY98q+28Im/zAowVOM540\n8/sgzPLOMtAOmZ7JQymRXiH8nwKBgQC3+TRz4POId1tK3YTGBcMF0o/OT6ULas9u\nNdqilr99oVe17Av+7UFonBlcpvX4l3WoPRpCnbQwLeGD3mdQ6sMDUFzJp/pXYOf+\nfj0JOHRsXJKF/htzrk2uurxkNJyQWpGzAUb9V08iemcYBm3+i5oHHpZmDOitBMz6\nnCyylWcisQKBgQDeVGdHY5XSqcnrG27BgqGLmDxZzhy8Jx/ua9eTzajY/mC4JXjJ\n3PZEURCFUFzUYW2ZBAvV9075syvpMonJPUhEZcNuXDyS/kNi/CPbvXbbk6JPjdQg\ncl/tCPcRx0HEU+pamUh2jYtJFLPDWJw3/YxmQQu0x3bq1jRJzFTPZf9nZwKBgAJ7\n/gZWklNUcUoohaN67nBEsKZzkuH9lkGBvqsVaA6VQC73ug2+PHTiLsF+i7HIsdEM\nyi7+HDHOXM5AEZsZIHsJ+cbLWukVKOzZ3Y8jUQcplNz0WoCMaQYkBWlBAKA+aNtG\n+CNxq2Lmzj+XzqJyVikkc5l7MSUs/Guh8kSTGepxAoGBAJPAMUP6gUlB4Y2zjEHh\n5vZ6Q2aAGjSVcBhYSTMqC0ifwrcfAVBvRmHag9zja7DJgbTdtx6AWFzTTmpHvfU6\nx5iQphIiLbawo+17vAkv7JpNLPfPaRcvOoNlZQ8juTp7rOEwwtrSYhWc5M8TWQZr\ndlwvBlplVTe595NQrrGOioqb\n-----END PRIVATE KEY-----\n`;

async function test() {
    console.log('--- Testing Hardcoded Key ---');
    try {
        const creds = {
            client_email: "trustscan-vision@trustscan-485113.iam.gserviceaccount.com",
            private_key: rawKey
        };

        const client = new vision.ImageAnnotatorClient({ credentials: creds });
        console.log('Client initialized.');

        console.log('Performing call...');
        const tinyPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        const [result] = await client.textDetection({ image: { content: tinyPixel } });
        console.log('✅ SUCCESS! Hardcoded key works.');
    } catch (err) {
        console.error('❌ Failed:', err.message);
    }
}

test();
