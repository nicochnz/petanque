import mongoose from 'mongoose';

const terrainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: '' }
  },
  imageUrl: { type: String },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Terrain = mongoose.models.Terrain || mongoose.model('Terrain', terrainSchema); 