const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['cat', 'dog', 'bird', 'rabbit', 'other'], required: true },
  breed: { type: String, trim: true },
  age: { type: Number, required: true, min: 0 }, // in months
  gender: { type: String, enum: ['male', 'female'], required: true },
  city: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  photoUrl: { type: String, trim: true },
  status: { type: String, enum: ['available', 'adopted'], default: 'available' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Pet', petSchema);
