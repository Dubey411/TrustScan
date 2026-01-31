
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const canvas = require('@napi-rs/canvas');
const { createCanvas, Image, Canvas, ImageData, Path2D } = canvas;

// Minimum globals for PDF.js Node support
global.Canvas = Canvas;
global.Image = Image;
global.ImageData = ImageData;
global.Path2D = Path2D;
global.createCanvas = createCanvas;

// DO NOT set window, document, etc. globally as it confuses Tesseract
// and can cause native crashes in PDF.js 5.x

console.log("[Globals] Minimal Canvas/Image polyfills set.");
