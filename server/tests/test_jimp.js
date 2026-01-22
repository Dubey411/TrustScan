import fs from 'fs';

async function testJimp() {
    console.log('--- Testing Jimp Import ---');
    try {
        const JimpModule = await import('jimp');
        console.log('JimpModule Keys:', Object.keys(JimpModule));
        
        let Jimp = JimpModule.default || JimpModule.Jimp || JimpModule;
        if (typeof Jimp !== 'function' && typeof Jimp.read !== 'function') {
            console.log('Trying Jimp from keys...');
        }
        
        // Create a dummy image buffer (1x1 pixel PNG)
        // Red pixel
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
        
        console.log('Attempting to read buffer...');
        const image = await Jimp.read(buffer);
        console.log(`✅ Jimp Read Success. Width: ${image.bitmap.width}`);
        
        image.greyscale();
        console.log('✅ Greyscale applied');

        const mime = 'image/png';
        console.log('Attempting getBuffer...');
        
        let buff;
        if (typeof image.getBufferAsync === 'function') {
             buff = await image.getBufferAsync(mime);
             console.log('✅ getBufferAsync success. Size:', buff.length);
        } else {
             buff = await new Promise((resolve, reject) => {
                image.getBuffer(mime, (err, b) => {
                    if (err) reject(err);
                    else resolve(b);
                });
             });
             console.log('✅ getBuffer (callback) success. Size:', buff.length);
        }
        
    } catch (err) {
        console.error('❌ Jimp Failed:', err);
    }
}

testJimp();
