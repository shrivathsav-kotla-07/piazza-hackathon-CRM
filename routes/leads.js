const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// @route   GET api/leads
// @desc    Get all leads with pagination, filtering, and sorting
// @access  Public
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, filter = 'all', sortField = 'createdAt', sortOrder = 'desc' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filterQuery = filter === 'all' ? {} : { status: filter };
  const sortQuery = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

  try {
    const leads = await Lead.find(filterQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Lead.countDocuments(filterQuery);
    
    res.json({
      leads,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/leads
// @desc    Create a new lead
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const newLead = new Lead({
      name,
      email,
      phone,
    });

    const lead = await newLead.save();
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/leads/:id
// @desc    Update lead status
// @access  Public
router.patch('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    lead.status = req.body.status;
    // If status is being set to 'Contacted', update dateContacted
    if (req.body.status === 'Contacted') {
      lead.dateContacted = new Date();
    }
    await lead.save();

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/leads/:id
// @desc    Delete a lead
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    res.json({ msg: 'Lead removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
