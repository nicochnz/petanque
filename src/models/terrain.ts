import mongoose from 'mongoose';

const TerrainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String,
  },
  imageUrl: String,
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  ratings: [{
    userId: { type: String, required: true },
    rating: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  reports: [{
    userId: { type: String, required: true },
    reason: { 
      type: String, 
      enum: ['spam', 'inappropriate', 'offensive', 'fake', 'duplicate', 'other'],
      required: true 
    },
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

TerrainSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Terrain || mongoose.model('Terrain', TerrainSchema);