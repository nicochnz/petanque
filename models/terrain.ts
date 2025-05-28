import mongoose from 'mongoose';

const TerrainSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  imageUrl: String,
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Terrain || mongoose.model('Terrain', TerrainSchema);
