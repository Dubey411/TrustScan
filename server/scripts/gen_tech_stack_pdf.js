import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createTechArchitecturePdf() {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([600, 850]);
  const { width, height } = page.getSize();
  let currentY = height - 50;

  const drawText = (text, size = 11, isBold = false) => {
    page.drawText(text, {
      x: 50,
      y: currentY,
      size,
      font: isBold ? timesRomanBoldFont : timesRomanFont,
      color: rgb(0, 0, 0),
    });
    currentY -= (size + 6);
  };

  const drawSection = (title) => {
    currentY -= 15;
    drawText(title, 16, true);
    currentY -= 5;
  };

  const drawSubTitle = (title) => {
    drawText(title, 12, true);
  };

  const drawPoint = (point, description) => {
    drawText(`• ${point}:`, 11, true);
    const words = description.split(' ');
    let line = "  ";
    for (const word of words) {
        if (line.length + word.length > 85) {
            drawText(line, 10);
            line = "  " + word + " ";
        } else {
            line += word + " ";
        }
    }
    drawText(line, 10);
    currentY -= 5;
  }

  // Header
  drawText('TrustScan: AI & ML Architecture Report', 22, true);
  drawText('Technical Implementation & Calculation Logic', 14, false);
  currentY -= 20;

  // Section 1: Calculations
  drawSection('1. Core Detection Algorithms');
  
  drawPoint('Logistic Regression Inference', 'The primary scoring mechanism. Risk is calculated using the Sigmoid function: P = 1 / (1 + exp(-z)), where z is the weighted sum of over 20+ signals plus a learned bias.');
  
  drawPoint('Error Level Analysis (ELA)', 'A pixel-diff strategy where images are resaved at 90% quality and compared to the original. We calculate the artifactCount / totalPixels ratio to detect digital manipulation.');
  
  drawPoint('Fuzzy Keyword Matching', 'Adversarial defense using non-alphanumeric striping. It ensures "P-a-y-m-e-n-t" matches the "payment" rule by calculating matches on stripped string vectors.');
  
  drawPoint('GST Validator (Mod-36)', 'A mathematical validation of Indian Business IDs using the official checksum algorithm. Each character is mapped to a code point and verified against a weighted sum modulo 36.');

  drawPoint('K-Fold Cross-Validation', 'Training stability is ensured by splitting the dataset into 5 unique "folds" and validating that precision remains consistent across all subsets.');

  // Section 2: Tech Stack
  drawSection('2. Machine Learning Tech Stack');
  
  drawSubTitle('Python Layer (Training & Retraining)');
  drawPoint('Scikit-Learn', 'Used for training our Layer 1 Logistic Regression models, performing Stratified K-Fold validation, and calculating precision metrics.');
  drawPoint('Pandas & NumPy', 'The backbone for data manipulation. Used to clean MongoDB exports and perform high-speed vector calculations for model weights.');
  drawPoint('PyMongo', 'Connects the Python training scripts directly to our scan production database for automated model updates.');

  drawSubTitle('Node.js Layer (Production Inference)');
  drawPoint('Tesseract.js', 'Provides the OCR engine. We utilize a "Multi-Pass" strategy (Standard vs Thresholded) for maximum accuracy on low-quality scans.');
  drawPoint('Jimp', 'Advanced image processing library used for normalization, contrast stretching, and pixel-level forgery analysis.');
  drawPoint('pdfjs-dist', 'High-performance PDF brain used to render document pages into high-resolution images for analysis.');
  drawPoint('pdf-lib', 'The library used to generate technical reports and documentation (including this PDF).');

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(path.dirname(__dirname), 'TrustScan_Tech_Architecture.pdf');
  fs.writeFileSync(outputPath, pdfBytes);

  console.log(`✅ Tech Stack PDF created at: ${outputPath}`);
}

createTechArchitecturePdf().catch(err => console.error(err));
