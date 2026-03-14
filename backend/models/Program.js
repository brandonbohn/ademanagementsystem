import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  spent: {
    type: Number,
    default: 0
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'planned', 'on-hold'],
    default: 'planned'
  },
  beneficiaries: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Program', programSchema);
