import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '/default-avatar.png',
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['user', 'guest'],
    default: 'user',
  },
  points: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  badges: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now }
  }],
  unlockedAvatars: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cost: { type: Number, required: true },
    unlockedAt: { type: Date, default: Date.now }
  }],
  unlockedBanners: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cost: { type: Number, required: true },
    unlockedAt: { type: Date, default: Date.now }
  }],
  currentAvatar: {
    type: String,
    default: 'default'
  },
  currentBanner: {
    type: String,
    default: 'default'
  },
  stats: {
    terrainsCreated: { type: Number, default: 0 },
    commentsPosted: { type: Number, default: 0 },
    terrainsRated: { type: Number, default: 0 },
    reportsSubmitted: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Mettre à jour le champ updatedAt avant chaque sauvegarde
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.models.User || mongoose.model('User', userSchema); 