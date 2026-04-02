import mongoose from 'mongoose';
import { analyzeScamScript } from '../analysis/scriptScanner.js';
import { warmDocumentPipelineDependencies } from '../processing/documentPipeline.js';

const WARMUP_SAMPLE_TEXT = `
Final notice for account verification. Registration fee is required immediately.
This urgent document mentions training fee, security deposit, and call now instructions.
Please avoid blackout and complete the payment request link process today.
`;

export async function runWarmupCycle(options = {}) {
  const startedAt = Date.now();
  const includeDocumentPipeline = options.includeDocumentPipeline === true;
  const status = {
    db: 'skipped',
    threatEngine: 'skipped',
    documentPipeline: includeDocumentPipeline ? 'skipped' : 'disabled',
    durationMs: 0,
  };

  try {
    if (mongoose.connection?.db) {
      await mongoose.connection.db.admin().ping();
      status.db = 'ok';
    }
  } catch (error) {
    status.db = `error:${error.message}`;
  }

  try {
    const result = analyzeScamScript(WARMUP_SAMPLE_TEXT);
    status.threatEngine = result?.riskScore >= 0 ? 'ok' : 'unexpected';
  } catch (error) {
    status.threatEngine = `error:${error.message}`;
  }

  if (includeDocumentPipeline) {
    try {
      await warmDocumentPipelineDependencies();
      status.documentPipeline = 'ok';
    } catch (error) {
      status.documentPipeline = `error:${error.message}`;
    }
  }

  status.durationMs = Date.now() - startedAt;
  return status;
}
