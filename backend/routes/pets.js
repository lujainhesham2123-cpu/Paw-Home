const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');

// POST /api/pets — Post a pet for adoption
router.post('/', async (req, res) => {
  try {
    const { name, type, breed, age, gender, city, description, photoUrl } = req.body;
    const owner = req.user?.id || req.body.owner;

    if (!name || !type || age === undefined || !gender || !city || !description || !owner) {
      return res.status(400).json({ message: 'All required pet fields and owner are required.' });
    }

    const pet = await Pet.create({
      name,
      type,
      breed: breed || '',
      age: Number(age),
      gender,
      city,
      description,
      photoUrl: photoUrl || '',
      status: 'available',
      owner,
    });

    res.status(201).json(pet);
  } catch (err) {
    res.status(500).json({ message: 'Server error posting pet', error: err.message });
  }
});

// GET /api/pets — Browse all available pets
router.get('/', async (req, res) => {
  try {
    const pets = await Pet.find({ status: 'available' }).sort({ createdAt: -1 });
    res.status(200).json(pets);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching pets', error: err.message });
  }
});

// GET /api/pets/mine — Get pets posted by the current owner
router.get('/mine', async (req, res) => {
  try {
    const owner = req.user?.id || req.query.owner;
    if (!owner) {
      return res.status(400).json({ message: 'owner is required.' });
    }

    const pets = await Pet.find({ owner }).sort({ createdAt: -1 });
    res.status(200).json(pets);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching your pets', error: err.message });
  }
});

module.exports = router;
