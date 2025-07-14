const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  status: {
    type: String,
    default: 'New',
  },
  source: {
    type: String,
    default: 'Manual',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  dateContacted: { // New field for date contacted
    type: Date,
    required: false, // Not required initially
  },
});

LeadSchema.method('deleteOne', async function () {
  return this.model('Lead').deleteOne({ _id: this._id });
});

module.exports = mongoose.model('Lead', LeadSchema);
