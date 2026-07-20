import mongoose, { Schema } from 'mongoose';

const BudgetSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  allocated: {
    type: Number,
    default: 0
  },
  remaining: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdDate: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});
 
export default mongoose.model('Budget', BudgetSchema);
