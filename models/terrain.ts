import mongoose from 'mongoose';

const TerrainSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Terrain || mongoose.model('Terrain', TerrainSchema);
