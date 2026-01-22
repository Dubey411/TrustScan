import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

async function createPdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 30;
  
  page.drawText('Transactions: $5000', {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('test.pdf', pdfBytes);
  console.log('✅ Generated test.pdf');
}

createPdf();
