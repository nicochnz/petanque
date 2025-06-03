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
  createdBy: { type: String, required: true }, // ID de l'utilisateur
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Terrain || mongoose.model('Terrain', TerrainSchema);
