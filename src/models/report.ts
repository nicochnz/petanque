import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['terrain', 'comment'], 
    required: true 
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  reporterId: { 
    type: String, 
    required: true 
  },
  reason: { 
    type: String, 
    enum: ['spam', 'inappropriate', 'offensive', 'fake', 'duplicate', 'other'],
    required: true 
  },
  description: { 
    type: String, 
    maxlength: 200 
  },
  status: { 
    type: String, 
    enum: ['pending', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  resolvedAt: Date,
  resolvedBy: String
});

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
