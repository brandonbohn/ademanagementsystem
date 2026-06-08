import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  programId: {
    type: String,
    required: true
  },
  programName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  receipt: {
    type: String,
    required: true
  },
  approvedBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  vendor: String,
  receiptNumber: String,
  paymentMethod: String,
  notes: String
}, {
  timestamps: true
});

export default mongoose.model('Expense', expenseSchema);
