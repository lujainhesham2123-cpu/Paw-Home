const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const AdoptionRequest = require('../models/AdoptionRequest');

// POST /api/requests — Send an adoption request
router.post('/', async (req, res) => {
  try {
    const { petId, ownerId, message } = req.body;
    const adopterId = req.user?.id || req.body.adopterId;

    if (!petId || !adopterId || !ownerId) {
      return res.status(400).json({ message: 'petId, adopterId, and ownerId are required.' });
    }

    if (adopterId.toString() === ownerId.toString()) {
      return res.status(400).json({ message: 'You cannot request to adopt your own pet.' });
    }

    // Check pet status if Pet model is registered
    if (mongoose.models.Pet) {
      const pet = await mongoose.models.Pet.findById(petId);
      if (!pet) return res.status(404).json({ message: 'Pet not found.' });
      if (pet.status !== 'available') {
        return res.status(400).json({ message: 'This pet is no longer available.' });
      }
    }

    // Prevent duplicate pending requests from the same adopter for the same pet
    const existing = await AdoptionRequest.findOne({
      pet: petId,
      adopter: adopterId,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this pet.' });
    }

    const request = await AdoptionRequest.create({
      pet: petId,
      adopter: adopterId,
      owner: ownerId,
      message: message || '',
      status: 'pending',
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating request', error: err.message });
  }
});

// GET /api/requests/mine — Get all requests sent by the current adopter
router.get('/mine', async (req, res) => {
  try {
    const adopterId = req.user?.id || req.query.adopterId;
    if (!adopterId) {
      return res.status(400).json({ message: 'adopterId is required.' });
    }

    let query = AdoptionRequest.find({ adopter: adopterId }).sort({ createdAt: -1 });
    if (mongoose.models.Pet) {
      query = query.populate('pet', 'name type breed city photoUrl status');
    }

    const requests = await query;
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching requests', error: err.message });
  }
});

// DELETE /api/requests/:id — Cancel (remove) a pending adoption request
router.delete('/:id', async (req, res) => {
  try {
    const adopterId = req.user?.id || req.body?.adopterId || req.query.adopterId;
    const request = await AdoptionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Adoption request not found.' });
    }

    if (adopterId && request.adopter.toString() !== adopterId.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this request.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be cancelled.' });
    }

    await AdoptionRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Adoption request cancelled and removed.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error cancelling request', error: err.message });
  }
});

module.exports = router;
