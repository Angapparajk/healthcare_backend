const express = require('express');
const router = express.Router();
const User = require('../Schema/users');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Email verification function
async function verifyEmail(email) {
  try {
    console.log('Verifying email:', email);
    // Replace YOUR_API_KEY with your actual API key from mailboxlayer
    const response = await axios.get(`https://api.mailboxlayer.com/check?access_key=${process.env.MAILBOXLAYER_API_KEY}&email=${email}`);
    console.log('Email verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Email verification error:', error);
    return null;
  }
}

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    // Verify email existence
    const emailVerification = await verifyEmail(email);
    console.log('Email verification result:', emailVerification);
    
    if (emailVerification) {
      if (emailVerification.format_valid === false) {
        return res.status(400).json({ message: 'Invalid email format.' });
      }
      if (emailVerification.mx_found === false) {
        return res.status(400).json({ message: 'Email domain does not exist.' });
      }
      if (emailVerification.smtp_check === false) {
        return res.status(400).json({ message: 'Email address does not exist.' });
      }
    } else {
      console.log('Email verification API failed, proceeding without verification');
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    // Generate JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
});

module.exports = router;
