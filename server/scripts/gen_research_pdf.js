import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createMlResearchPdf() {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  let currentY = height - 50;

  const drawText = (text, size = 12, isBold = false) => {
    page.drawText(text, {
      x: 50,
      y: currentY,
      size,
      font: isBold ? timesRomanBoldFont : timesRomanFont,
      color: rgb(0, 0, 0),
    });
    currentY -= (size + 5);
  };

  const drawSection = (title) => {
    currentY -= 15;
    drawText(title, 16, true);
    currentY -= 5;
  };

  const drawItem = (title, description) => {
    drawText(`• ${title}`, 12, true);
    // Rough line wrapping for description
    const words = description.split(' ');
    let line = "  ";
    for (const word of words) {
        if (line.length + word.length > 80) {
            drawText(line, 10);
            line = "  " + word + " ";
        } else {
            line += word + " ";
        }
    }
    drawText(line, 10);
    currentY -= 10;
  };

  // Header
  drawText('Essential ML Research Papers for TrustScan', 22, true);
  currentY -= 20;

  // Section 1
  drawSection('1. Forgery & Image Manipulation Detection');
  drawItem(
    '"A Picture is Worth a Thousand Lies: Photo Forensics" (H. Farid, 2009)',
    'A foundational guide to digital forensics explaining how to detect cloning, resampling, and lighting inconsistencies.'
  );
  drawItem(
    '"Digital Image Forgery Detection: A Survey" (S. Walia and K. Kumar, 2019)',
    'A comprehensive look at image forensics, including traditional methods and modern deep learning approaches.'
  );

  // Section 2
  drawSection('2. Document Intelligence & OCR');
  drawItem(
    '"LayoutLM: Pre-training of Text and Layout for Document Image Understanding" (Xu et al., 2020)',
    'A model that learns both text and its location, ideal for structured document extraction.'
  );
  drawItem(
    '"Donut: Document Understanding Transformer without OCR" (Kim et al., 2022)',
    'Explores OCR-free document understanding, directly mapping images to structured data.'
  );

  // Section 3
  drawSection('3. Fraud Detection & Imbalanced Learning');
  drawItem(
    '"SMOTE: Synthetic Minority Over-sampling Technique" (Chawla et al., 2002)',
    'The standard method for dealing with imbalanced datasets by generating synthetic minority samples.'
  );
  drawItem(
    '"Random Forests" (Leo Breiman, 2001)',
    'Explaning the tree-based ensemble method that handles non-linear relationships better than basic models.'
  );

  // Section 4
  drawSection('4. General ML Stability & Reliability');
  drawItem(
    '"Attention Is All You Need" (Vaswani et al., 2017)',
    'The foundational paper for Transformers, introducing the attention mechanism used in modern LLMs.'
  );
  drawItem(
    '"Hidden Technical Debt in Machine Learning Systems" (Sculley et al., Google, 2015)',
    'Focuses on the engineering challenges of maintaining ML systems in production.'
  );

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(path.dirname(__dirname), 'ML_Research_Recommendations.pdf');
  fs.writeFileSync(outputPath, pdfBytes);

  console.log(`✅ PDF created successfully at: ${outputPath}`);
}

createMlResearchPdf().catch(err => console.error(err));
