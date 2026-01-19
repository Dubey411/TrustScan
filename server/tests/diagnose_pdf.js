import { processDocument } from '../services/ocrProcessor.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

async function debugPDF() {
    console.log('🔍 Starting Deep PDF Diagnostics...');

    // 1. Check Python Environment
    const venvPythonPath = path.join(PROJECT_ROOT, '.venv', 'Scripts', 'python.exe');
    console.log(`Checking Python at: ${venvPythonPath}`);
    if (fs.existsSync(venvPythonPath)) {
        const pyVer = spawnSync(venvPythonPath, ['--version'], { encoding: 'utf8' });
        console.log(`✅ Python found: ${pyVer.stdout.trim() || pyVer.stderr.trim()}`);
        
        const depCheck = spawnSync(venvPythonPath, ['-c', 'import easyocr; import fitz; print("DEPS_OK")'], { encoding: 'utf8' });
        if (depCheck.stdout.includes('DEPS_OK')) {
            console.log('✅ Python dependencies (easyocr, fitz) are OK.');
        } else {
            console.error('❌ Python dependencies MISSING or BROKEN:');
            console.error(depCheck.stderr);
        }
    } else {
        console.error('❌ Virtual environment Python NOT FOUND at expected path.');
    }

    // 2. Test PDF-Parse
    console.log('\nTesting pdf-parse dependency...');
    try {
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        const pdf = require('pdf-parse');
        console.log('✅ pdf-parse imported successfully.');
    } catch (err) {
        console.error('❌ pdf-parse import FAILED:', err.message);
    }

    console.log('\nDiagnostics Complete.');
}

debugPDF();
