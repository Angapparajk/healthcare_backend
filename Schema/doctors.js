const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  availability: {
    type: String,
    enum: ['Available Today', 'Fully Booked', 'On Leave'],
    default: 'Available Today'
  },
  experience: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: 'Experienced healthcare professional'
  },
  workingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
