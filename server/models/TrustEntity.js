
import mongoose from 'mongoose';

const trustEntitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  nameLower: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    default: 'Documented Scam'
  },
  category: {
    type: String,
    enum: ['red_flag', 'grey_list'],
    required: true,
    index: true
  },
  addedAt: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  autoLearned: {
    type: Boolean,
    default: false
  },
  trustScore: {
    type: Number,
    default: 0
  },
  evidence: [String],
  lastOccurrence: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for fast text-like searching if needed later
trustEntitySchema.index({ nameLower: 'text' });

const TrustEntity = mongoose.model('TrustEntity', trustEntitySchema);

export default TrustEntity;
