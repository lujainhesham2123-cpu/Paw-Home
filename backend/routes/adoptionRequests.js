
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');

// POST /api/requests
// Send an adoption request
router.post('/', async (req, res) => {
  try {
    const { petId, ownerId, message } = req.body;
    const adopterId = req.user?.id || req.body.adopterId;

    if (!petId || !adopterId || !ownerId) {
      return res.status(400).json({
        message: 'petId, adopterId, and ownerId are required.',
      });
    }

    if (
      !mongoose.isValidObjectId(petId) ||
      !mongoose.isValidObjectId(adopterId) ||
      !mongoose.isValidObjectId(ownerId)
    ) {
      return res.status(400).json({ message: 'Invalid user or pet ID.' });
    }

    if (adopterId.toString() === ownerId.toString()) {
      return res.status(400).json({
        message: 'You cannot request to adopt your own pet.',
      });
    }

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found.' });
    }

    if (pet.status !== 'available') {
      return res.status(400).json({
        message: 'This pet is no longer available.',
      });
    }

    if (pet.owner.toString() !== ownerId.toString()) {
      return res.status(400).json({
        message: 'The owner ID does not match this pet.',
      });
    }

    const existing = await AdoptionRequest.findOne({
      pet: petId,
      adopter: adopterId,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({
        message: 'You already have a pending request for this pet.',
      });
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
    res.status(500).json({
      message: 'Server error creating request',
      error: err.message,
    });
  }
});

// GET /api/requests/mine
// Get requests sent by an adopter
router.get('/mine', async (req, res) => {
  try {
    const adopterId = req.user?.id || req.query.adopterId;

    if (!adopterId) {
      return res.status(400).json({
        message: 'adopterId is required.',
      });
    }

    if (!mongoose.isValidObjectId(adopterId)) {
      return res.status(400).json({ message: 'Invalid adopter ID.' });
    }

    const requests = await AdoptionRequest.find({
      adopter: adopterId,
    })
      .populate('pet', 'name type breed city photoUrl status')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({
      message: 'Server error fetching requests',
      error: err.message,
    });
  }
});

// GET /api/requests/incoming
// Get requests received by a pet owner
router.get('/incoming', async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
      return res.status(400).json({
        message: 'A valid ownerId is required.',
      });
    }

    const requests = await AdoptionRequest.find({
      owner: ownerId,
    })
      .populate('pet', 'name type breed city photoUrl status')
      .populate('adopter', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({
      message: 'Server error fetching incoming requests',
      error: err.message,
    });
  }
});

// PATCH /api/requests/:id/status
// Accept or reject an adoption request
router.patch('/:id/status', async (req, res) => {
  try {
    const { ownerId, status } = req.body;

    if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
      return res.status(400).json({
        message: 'A valid ownerId is required.',
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid adoption request ID.',
      });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be accepted or rejected.',
      });
    }

    const request = await AdoptionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: 'Adoption request not found.',
      });
    }

    if (request.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({
        message: 'You can only manage requests for your own pets.',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        message: 'This request has already been processed.',
      });
    }

    const pet = await Pet.findById(request.pet);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found.' });
    }

    if (pet.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({
        message: 'You do not own this pet.',
      });
    }

    if (status === 'accepted') {
      if (pet.status !== 'available') {
        return res.status(400).json({
          message: 'This pet is no longer available.',
        });
      }

      pet.status = 'adopted';
      await pet.save();

      // Reject all other pending requests for this pet
      await AdoptionRequest.updateMany(
        {
          pet: pet._id,
          _id: { $ne: request._id },
          status: 'pending',
        },
        { $set: { status: 'rejected' } }
      );
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      message: `Adoption request ${status} successfully.`,
      request,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Server error updating adoption request',
      error: err.message,
    });
  }
});

// DELETE /api/requests/:id
// Cancel a pending adoption request
router.delete('/:id', async (req, res) => {
  try {
    const adopterId =
      req.user?.id || req.body?.adopterId || req.query.adopterId;

    const request = await AdoptionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: 'Adoption request not found.',
      });
    }

    if (!adopterId || request.adopter.toString() !== adopterId.toString()) {
      return res.status(403).json({
        message: 'Not authorized to cancel this request.',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending requests can be cancelled.',
      });
    }

    await AdoptionRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Adoption request cancelled and removed.',
      id: req.params.id,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Server error cancelling request',
      error: err.message,
    });
  }
});

module.exports = router;
