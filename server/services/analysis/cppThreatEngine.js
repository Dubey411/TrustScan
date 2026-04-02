import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..', '..');
const signaturesJsonPath = path.join(ROOT, 'data', 'risk_weighted_phrases.json');
const compiledSignaturePath = path.join(ROOT, 'data', 'compiled_threat_signatures.tsv');
const nativeBinaryPath = path.join(ROOT, 'native', 'bin', 'threat_signature_engine.exe');

let signatureCacheKey = null;

function flattenSignatures(signatures) {
  return Object.entries(signatures).flatMap(([category, items]) =>
    Object.entries(items || {}).map(([phrase, weight]) => ({ category, phrase, weight }))
  );
}

function ensureCompiledSignatures() {
  const raw = fs.readFileSync(signaturesJsonPath, 'utf8');
  if (signatureCacheKey === raw && fs.existsSync(compiledSignaturePath)) {
    return compiledSignaturePath;
  }

  const signatures = JSON.parse(raw);
  const rows = flattenSignatures(signatures)
    .filter(({ phrase }) => phrase && phrase.trim())
    .map(({ category, phrase, weight }) => `${category}\t${weight}\t${phrase.trim()}`);

  fs.writeFileSync(compiledSignaturePath, rows.join('\n'), 'utf8');
  signatureCacheKey = raw;
  return compiledSignaturePath;
}

export function isNativeThreatEngineAvailable() {
  return fs.existsSync(nativeBinaryPath);
}

export function scanThreatSignaturesNative(text) {
  if (!text || !isNativeThreatEngineAvailable()) {
    return null;
  }

  const normalizedInput = String(text).replace(/\s+/g, ' ').trim();
  if (!normalizedInput) {
    return null;
  }

  const signaturesPath = ensureCompiledSignatures();
  const result = spawnSync(nativeBinaryPath, [signaturesPath], {
    input: `${normalizedInput}\n`,
    encoding: 'utf8',
    windowsHide: true,
    timeout: 5000,
  });

  if (result.error || result.status !== 0 || !result.stdout?.trim()) {
    return null;
  }

  const [scoreText = '0', categoryText = '', matchesText = ''] = result.stdout.trim().split('\t');
  const categories = categoryText ? categoryText.split(',').filter(Boolean) : [];
  const matches = matchesText
    ? matchesText.split('|||').map((entry) => {
        const [category, phrase, weightText] = entry.split('::');
        return {
          category,
          phrase,
          weight: Number(weightText) || 0,
        };
      })
    : [];

  return {
    score: Number(scoreText) || 0,
    categories,
    matches,
  };
}
