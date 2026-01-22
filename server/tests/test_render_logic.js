import fs from 'fs';
import { pathToFileURL } from 'url';

// Dynamic import strategy to test internal function by temporarily exposing it or just copying the logic.
// For now, I'll copy the logic of renderPdfToImages into this test script to verify the DEPENDENCIES work.
// If this script works, then the integrity of the libraries is fine.

async function testRender() {
    console.log('--- Testing PDF Rendering (Logic Replication) ---');
    try {
        const pdfBuffer = fs.readFileSync('test.pdf');
        
        // Use LEGACY build
        const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs'); 
        const { createCanvas } = await import('canvas');

        const NodeCanvasFactory = {
            create: function (width, height) {
                const canvas = createCanvas(width, height);
                const context = canvas.getContext('2d');
                return { canvas, context, width, height };
            },
            reset: function (ctx, width, height) {
                ctx.canvas.width = width;
                ctx.canvas.height = height;
            },
            destroy: function (ctx) {
                ctx.canvas = null;
                ctx.context = null;
            }
        };

        const loadingTask = getDocument({
            data: new Uint8Array(pdfBuffer),
            canvasFactory: NodeCanvasFactory,
            disableFontFace: true,
            verbosity: 0
        });

        const pdfDoc = await loadingTask.promise;
        console.log(`✅ Loaded PDF. Pages: ${pdfDoc.numPages}`);
        
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        await page.render({
            canvasContext: context,
            viewport: viewport,
            canvasFactory: NodeCanvasFactory
        }).promise;

        const imgBuffer = canvas.toBuffer('image/png');
        console.log(`✅ Rendered Page 1. Image Size: ${imgBuffer.length} bytes`);
        
    } catch (err) {
        console.error('❌ PDF Rendering Failed:', err);
    }
}

testRender();
