# NirogGyan Healthcare Backend

A simple Node.js/Express backend for the healthcare appointment booking system.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure MongoDB Atlas**
   - Replace `YOUR_MONGODB_ATLAS_CONNECTION_STRING` in `index.js` with your actual MongoDB Atlas connection string
   - Or set the `MONGODB_URI` environment variable

3. **Start the Server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor
- `GET /api/doctors/search/:query` - Search doctors by name or specialization

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/doctor/:doctorId` - Get appointments by doctor
- `GET /api/appointments/patient/:email` - Get appointments by patient email

## Sample Data for Testing

### Create a Doctor (POST /api/doctors)
```json
{
  "name": "Dr. John Smith",
  "specialization": "Cardiology",
  "email": "john.smith@hospital.com",
  "phone": "+1234567890",
  "profileImage": "https://via.placeholder.com/150",
  "availability": "Available Today",
  "experience": 15,
  "description": "Experienced cardiologist with 15 years of practice",
  "workingHours": {
    "start": "09:00",
    "end": "17:00"
  }
}
```

### Create an Appointment (POST /api/appointments)
```json
{
  "patientName": "Jane Doe",
  "patientEmail": "jane.doe@email.com",
  "doctorId": "DOCTOR_ID_HERE",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "10:00",
  "notes": "Regular checkup"
}
```

## Testing with Postman

1. **Test the API base URL**: `GET http://localhost:5000/`
2. **Create a doctor**: `POST http://localhost:5000/api/doctors`
3. **Get all doctors**: `GET http://localhost:5000/api/doctors`
4. **Create an appointment**: `POST http://localhost:5000/api/appointments`
5. **Get all appointments**: `GET http://localhost:5000/api/appointments`

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string 