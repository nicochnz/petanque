import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  terrainId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Terrain', 
    required: true 
  },
  userId: { 
    type: String, 
    required: true 
  },
  userName: { 
    type: String, 
    required: true 
  },
  userImage: { 
    type: String, 
    default: '/default-avatar.png' 
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  reports: [{
    userId: { type: String, required: true },
    reason: { 
      type: String, 
      enum: ['spam', 'inappropriate', 'offensive', 'fake', 'other'],
      required: true 
    },
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
