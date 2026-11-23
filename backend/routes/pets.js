const express = require('express');
const Pet = require('../models/Pet');

const router = express.Router();

// GET /api/pets — Browse all available pets
router.get('/', async (req, res) => {
  try {
    const pets = await Pet.find({ status: 'available' }).sort({ createdAt: -1 });
    res.status(200).json(pets);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching pets', error: err.message });
  }
});

// GET /api/pets/mine?owner=<userId> — Get pets posted by a specific user
router.get('/mine', async (req, res) => {
  try {
    const { owner } = req.query;
    if (!owner) {
      return res.status(400).json({ message: 'owner is required.' });
    }

    const pets = await Pet.find({ owner }).sort({ createdAt: -1 });
    res.status(200).json(pets);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching your pets', error: err.message });
  }
});

// POST /api/pets — Post a new pet for adoption
router.post('/', async (req, res) => {
  try {
    const { name, type, breed, age, gender, city, description, photoUrl, owner } = req.body;

    if (!name || !type || age === undefined || age === '' || !gender || !city || !description || !owner) {
      return res.status(400).json({
        message: 'name, type, age, gender, city, description, and owner are required.',
      });
    }

    const pet = await Pet.create({
      name: String(name).trim(),
      type,
      breed: breed ? String(breed).trim() : '',
      age: Number(age),
      gender,
      city: String(city).trim(),
      description: String(description).trim(),
      photoUrl: photoUrl ? String(photoUrl).trim() : '',
      status: 'available',
      owner,
    });

    res.status(201).json(pet);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating pet post', error: err.message });
  }
});

// PUT /api/pets/:id — Edit an existing pet post (owner only)
router.put('/:id', async (req, res) => {
  try {
    const { owner, name, type, breed, age, gender, city, description, photoUrl } = req.body;

    if (!owner) {
      return res.status(400).json({ message: 'owner is required to edit a pet post.' });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet post not found.' });
    }

    if (pet.owner.toString() !== String(owner).trim()) {
      return res.status(403).json({ message: 'You can only edit your own pet posts.' });
    }

    if (name !== undefined) pet.name = String(name).trim();
    if (type !== undefined) pet.type = type;
    if (breed !== undefined) pet.breed = String(breed).trim();
    if (age !== undefined && age !== '') pet.age = Number(age);
    if (gender !== undefined) pet.gender = gender;
    if (city !== undefined) pet.city = String(city).trim();
    if (description !== undefined) pet.description = String(description).trim();
    if (photoUrl !== undefined) pet.photoUrl = String(photoUrl).trim();

    const updatedPet = await pet.save();
    res.status(200).json(updatedPet);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating pet post', error: err.message });
  }
});

// DELETE /api/pets/:id — Delete an existing pet post (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const owner = req.body?.owner || req.query?.owner;

    if (!owner) {
      return res.status(400).json({ message: 'owner is required to delete a pet post.' });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet post not found.' });
    }

    if (pet.owner.toString() !== String(owner).trim()) {
      return res.status(403).json({ message: 'You can only delete your own pet posts.' });
    }

    await Pet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Pet post deleted successfully.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting pet post', error: err.message });
  }
});

module.exports = router;