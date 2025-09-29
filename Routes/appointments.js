const express = require('express');
const router = express.Router();

const Appointment = require('../Schema/appointments');
const Doctor = require('../Schema/doctors');
const transporter = require('../nodemailer');
const emailValidationMiddleware = require('../middleware/emailValidation');

// JWT authentication middleware
const jwt = require('jsonwebtoken');
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Get appointments for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientEmail: req.user.email }).populate('doctorId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Get single appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctorId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment', error: error.message });
  }
});

// Create new appointment with email validation
router.post('/', emailValidationMiddleware, authMiddleware, async (req, res) => {
  try {
    // Check if doctor exists
    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId: req.body.doctorId,
      appointmentDate: req.body.appointmentDate,
      appointmentTime: req.body.appointmentTime,
      status: { $ne: 'Cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Always use logged-in user's email
    const appointmentData = {
      ...req.body,
      patientEmail: req.user.email
    };
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    // Populate doctor info before sending response
    const populatedAppointment = await Appointment.findById(savedAppointment._id).populate('doctorId');

    // Send confirmation email to patient
    const formattedDate = new Date(savedAppointment.appointmentDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Format time to include AM/PM
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };
    
    const formattedTime = formatTime(savedAppointment.appointmentTime);
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: req.user.email,
      subject: 'Appointment Confirmation - NirogGyan Healthcare',
      text: `Dear ${savedAppointment.patientName},\n\nYour appointment with Dr. ${populatedAppointment.doctorId?.name || '-'} is confirmed.\n\nDate: ${formattedDate}\nTime: ${formattedTime}\n\nThank you for booking with NirogGyan Healthcare!\n\nRegards,\nNirogGyan Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Appointment Confirmation</h2>
          <p>Dear <strong>${savedAppointment.patientName}</strong>,</p>
          <p>Your appointment with <strong>Dr. ${populatedAppointment.doctorId?.name || '-'}</strong> is confirmed.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${formattedTime}</p>
          </div>
          <p>Thank you for booking with NirogGyan Healthcare!</p>
          <p style="color: #059669;"><strong>Regards,<br>NirogGyan Team</strong></p>
        </div>
      `
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending confirmation email:', err);
      } else {
        console.log('Confirmation email sent:', info.response);
      }
    });

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating appointment', error: error.message });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('doctorId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating appointment', error: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
});

// Get appointments by doctor ID
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId }).populate('doctorId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Get appointments by patient email
router.get('/patient/:email', async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientEmail: req.params.email }).populate('doctorId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

module.exports = router;
