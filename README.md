# Clinic Management Backend

A comprehensive backend system for clinic management with patient, doctor, and admin modules built with Node.js, Express.js, and Supabase.

## Features

### Patient Module
- ✅ Register and login
- ✅ View doctors and their specialties
- ✅ Book appointments in available time slots
- ✅ Cancel or reschedule appointments

### Doctor Module
- ✅ View upcoming appointments
- ✅ Manage availability and time slots
- ✅ Access patient history

### Admin Module
- ✅ Manage doctors, patients, and clinic chambers
- ✅ Oversee all appointments
- ✅ Dashboard statistics

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest, Supertest

## Project Structure

```
backend/
│
├── config/
│   └── db.js               # Database connection
│
├── controllers/            # Business logic
│   ├── doctorController.js
│   ├── patientController.js
│   ├── adminController.js
│   └── appointmentController.js
│
├── middlewares/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
│
├── routes/
│   ├── doctorRoutes.js
│   ├── patientRoutes.js
│   ├── adminRoutes.js
│   └── appointmentRoutes.js
│
├── test/
│   └── test-signup.js
│
├── server.js
├── package.json
├── .env.example
└── README.md
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   ```

4. Set up your Supabase database with the required tables (see Database Schema section)

5. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Patient Routes
- `POST /api/patients/register` - Register new patient
- `POST /api/patients/login` - Patient login
- `GET /api/patients/doctors` - Get all doctors
- `GET /api/patients/doctors/:doctorId/availability` - Get doctor availability
- `POST /api/patients/appointments` - Book appointment
- `GET /api/patients/appointments` - Get patient appointments
- `PUT /api/patients/appointments/:appointmentId/cancel` - Cancel appointment
- `PUT /api/patients/appointments/:appointmentId/reschedule` - Reschedule appointment

### Doctor Routes
- `POST /api/doctors/login` - Doctor login
- `GET /api/doctors/appointments/upcoming` - Get upcoming appointments
- `GET /api/doctors/appointments/history` - Get appointment history
- `GET /api/doctors/patients/:patientId/history` - Get patient history
- `POST /api/doctors/availability` - Add availability
- `GET /api/doctors/availability` - Get availability
- `PUT /api/doctors/availability/:availabilityId` - Update availability
- `DELETE /api/doctors/availability/:availabilityId` - Delete availability
- `PUT /api/doctors/appointments/:appointmentId/complete` - Complete appointment

### Admin Routes
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/doctors` - Get all doctors
- `POST /api/admin/doctors` - Create doctor
- `PUT /api/admin/doctors/:doctorId` - Update doctor
- `DELETE /api/admin/doctors/:doctorId` - Delete doctor
- `GET /api/admin/patients` - Get all patients
- `GET /api/admin/patients/:patientId` - Get patient details
- `PUT /api/admin/patients/:patientId` - Update patient
- `DELETE /api/admin/patients/:patientId` - Delete patient
- `GET /api/admin/chambers` - Get all chambers
- `POST /api/admin/chambers` - Create chamber
- `PUT /api/admin/chambers/:chamberId` - Update chamber
- `DELETE /api/admin/chambers/:chamberId` - Delete chamber
- `GET /api/admin/appointments` - Get all appointments

### Appointment Routes
- `GET /api/appointments` - Get appointments (with filters)
- `GET /api/appointments/today` - Get today's appointments
- `GET /api/appointments/statistics` - Get appointment statistics
- `GET /api/appointments/range` - Get appointments by date range
- `GET /api/appointments/:appointmentId` - Get appointment details
- `PUT /api/appointments/:appointmentId/status` - Update appointment status
- `DELETE /api/appointments/:appointmentId` - Delete appointment

### Health Check
- `GET /api/health` - Server health check

## Database Schema

### Tables Required:

1. **patients**
   - id (uuid, primary key)
   - name (text)
   - email (text, unique)
   - password (text)
   - phone (text)
   - age (integer)
   - gender (text)
   - address (text)
   - created_at (timestamp)
   - updated_at (timestamp)

2. **doctors**
   - id (uuid, primary key)
   - name (text)
   - email (text, unique)
   - password (text)
   - phone (text)
   - specialty (text)
   - experience_years (integer)
   - chamber_id (uuid, foreign key)
   - is_active (boolean)
   - created_at (timestamp)
   - updated_at (timestamp)

3. **admins**
   - id (uuid, primary key)
   - name (text)
   - email (text, unique)
   - password (text)
   - role (text)
   - created_at (timestamp)
   - updated_at (timestamp)

4. **chambers**
   - id (uuid, primary key)
   - name (text)
   - address (text)
   - phone (text)
   - email (text)
   - created_at (timestamp)
   - updated_at (timestamp)

5. **appointments**
   - id (uuid, primary key)
   - patient_id (uuid, foreign key)
   - doctor_id (uuid, foreign key)
   - availability_id (uuid, foreign key)
   - appointment_date (date)
   - start_time (time)
   - end_time (time)
   - status (text: scheduled, rescheduled, completed, cancelled, no-show)
   - notes (text)
   - created_at (timestamp)
   - updated_at (timestamp)

6. **doctor_availability**
   - id (uuid, primary key)
   - doctor_id (uuid, foreign key)
   - date (date)
   - start_time (time)
   - end_time (time)
   - is_available (boolean)
   - created_at (timestamp)
   - updated_at (timestamp)

## Testing

Run the test suite:
```bash
npm test
```

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRE`: Token expiration time (default: 7d)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
