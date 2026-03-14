import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['financial', 'program', 'donor', 'quarterly', 'annual'],
    required: true
  },
  period: {
    type: String,
    required: true
  },
  generatedDate: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  totalBudget: {
    type: Number,
    required: true
  },
  totalSpent: {
    type: Number,
    required: true
  },
  programsCount: {
    type: Number,
    required: true
  },
  beneficiariesReached: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);
