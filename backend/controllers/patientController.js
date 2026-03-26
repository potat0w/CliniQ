const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const csv = require('csv-parser');
const fs = require('fs');
const supabase = require('../config/db');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, phone, age, gender } = req.body;

  const { data: existingUser } = await supabase
    .from('patients')
    .select('patient_id')
    .eq('email', email)
    .single();

  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: patient, error } = await supabase
    .from('patients')
    .insert([{
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      age: age || null,
      gender: gender || null
    }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const token = generateToken(patient.patient_id, 'patient');

  res.status(201).json({
    message: 'Patient registered successfully',
    patient: {
      id: patient.patient_id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender
    },
    token
  });
});

const loginPatient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !patient) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, patient.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(patient.patient_id, 'patient');

  res.json({
    message: 'Login successful',
    patient: {
      id: patient.patient_id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender
    },
    token
  });
});

const getDoctors = asyncHandler(async (req, res) => {
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      doctor_id,
      doctor_name,
      email,
      speciality,
      experience,
      education,
      chambers(
        chamber_id,
        chamber_name,
        location,
        specialties
      )
    `);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const formattedDoctors = (doctors || []).map(doctor => ({
    doctor_id: doctor.doctor_id,
    doctor_name: doctor.doctor_name,
    email: doctor.email,
    speciality: doctor.speciality,
    experience: doctor.experience || 0,
    education: doctor.education || [],
    chamber: doctor.chambers?.[0]?.chamber_name || '',
    location: doctor.chambers?.[0]?.location || '',
    concentration: doctor.chambers?.[0]?.specialties || [],
    certifications: {}, // Add if needed from database
    specializations: {} // Add if needed from database
  }));

  res.json({ doctors: formattedDoctors });
});

const getDoctorAvailability = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const { data: availability, error } = await supabase
    .from('slots')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('status', 'available')
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Return available slots or empty array if none exist
  res.json(availability || []);
});

const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, slotId, notes } = req.body;
  const patientId = req.user.userId;

  // If no slotId provided, create a default slot for voice assistant bookings
  let targetSlot;
  if (!slotId) {
    // Create a temporary slot for voice assistant bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Convert day to number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = tomorrow.getDay();
    
    targetSlot = {
      slot_id: `va_${Date.now()}`,
      doctor_id: doctorId,
      chamber_id: 1,
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '10:00',
      status: 'available'
    };
  } else {
    // Get the specified slot
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select('*')
      .eq('slot_id', slotId)
      .eq('doctor_id', doctorId)
      .eq('status', 'available')
      .single();

    if (slotError || !slot) {
      return res.status(400).json({ error: 'Time slot not available' });
    }
    targetSlot = slot;
  }

  // Generate appointment_date - next occurrence of the slot's day_of_week
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const slotDayOfWeek = targetSlot.day_of_week; // Assuming 0 = Sunday, 1 = Monday, etc.
  
  // Calculate days until next occurrence of the slot's day
  let daysUntilSlot = (slotDayOfWeek - currentDayOfWeek + 7) % 7;
  if (daysUntilSlot === 0) {
    daysUntilSlot = 7; // If today is the day, pick next week
  }
  
  // Calculate the appointment date
  const appointmentDate = new Date(today);
  appointmentDate.setDate(today.getDate() + daysUntilSlot);
  
  // Format as YYYY-MM-DD for database
  const formattedAppointmentDate = appointmentDate.toISOString().split('T')[0];

  // Get patient info for name and phone
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('name, phone')
    .eq('patient_id', patientId)
    .single();

  // Generate a unique appointment_id
  const { data: maxId, error: maxIdError } = await supabase
    .from('appointments')
    .select('appointment_id')
    .order('appointment_id', { ascending: false })
    .limit(1);

  let newAppointmentId = 1;
  if (!maxIdError && maxId.length > 0) {
    newAppointmentId = maxId[0].appointment_id + 1;
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert([{
      appointment_id: newAppointmentId,
      doctor_id: doctorId,
      chamber_id: targetSlot.chamber_id,
      day_of_week: targetSlot.day_of_week,
      start_time: targetSlot.start_time,
      end_time: targetSlot.end_time,
      patient_id: patientId,
      status: 'scheduled',
      appointment_date: formattedAppointmentDate
    }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Only update slot status if it's a real slot (not voice assistant generated)
  if (slotId) {
    await supabase
      .from('slots')
      .update({ status: 'booked' })
      .eq('slot_id', slotId);
  }

  res.status(201).json({
    message: 'Appointment booked successfully',
    appointment
  });
});

const getAppointments = asyncHandler(async (req, res) => {
  const patientId = req.user.userId;

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctors (
        doctor_id,
        doctor_name,
        email,
        speciality
      ),
      patients (
        patient_id,
        name,
        phone,
        email
      )
    `)
    .eq('patient_id', patientId)
    .order('booking_time', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(appointments);
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const patientId = req.user.userId;

  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .single();

  if (fetchError || !appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (appointment.status === 'cancelled') {
    return res.status(400).json({ error: 'Appointment already cancelled' });
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  await supabase
    .from('doctor_availability')
    .update({ is_available: true })
    .eq('id', appointment.availability_id);

  res.json({ message: 'Appointment cancelled successfully' });
});

const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { newAvailabilityId } = req.body;
  const patientId = req.user.userId;

  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .single();

  if (fetchError || !appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const { data: newAvailability, error: availabilityError } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('id', newAvailabilityId)
    .eq('doctor_id', appointment.doctor_id)
    .eq('is_available', true)
    .single();

  if (availabilityError || !newAvailability) {
    return res.status(400).json({ error: 'New time slot not available' });
  }

  await supabase
    .from('doctor_availability')
    .update({ is_available: true })
    .eq('id', appointment.availability_id);

  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      availability_id: newAvailabilityId,
      appointment_date: newAvailability.date,
      start_time: newAvailability.start_time,
      end_time: newAvailability.end_time,
      status: 'rescheduled'
    })
    .eq('id', appointmentId);

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  await supabase
    .from('doctor_availability')
    .update({ is_available: false })
    .eq('id', newAvailabilityId);

  res.json({ message: 'Appointment rescheduled successfully' });
});

const getDoctorsFromCSV = asyncHandler(async (req, res) => {
  try {
    // First try to get doctors from database with chambers
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select(`
        doctor_id,
        doctor_name,
        email,
        speciality,
        experience,
        education,
        chambers(
          chamber_id,
          chamber_name,
          location,
          specialties
        )
      `);

    if (error) {
      console.error('Database error:', error);
      // Fallback to CSV if database fails
      return getDoctorsFromCSVFile(req, res);
    }

    if (doctors && doctors.length > 0) {
      const formattedDoctors = doctors.map(doctor => ({
        doctor_id: doctor.doctor_id,
        doctor_name: doctor.doctor_name,
        email: doctor.email,
        speciality: doctor.speciality,
        experience: doctor.experience,
        education: doctor.education || [],
        chamber: doctor.chambers?.[0]?.chamber_name || null,
        location: doctor.chambers?.[0]?.location || null,
        concentration: doctor.chambers?.[0]?.specialties || [],
        certifications: {}, // Add if needed
        specializations: {} // Add if needed
      }));

      res.json({
        doctors: formattedDoctors,
        total: formattedDoctors.length
      });
    } else {
      // Fallback to CSV if no doctors in database
      getDoctorsFromCSVFile(req, res);
    }
  } catch (error) {
    console.error('Error in getDoctorsFromCSV:', error);
    // Fallback to CSV
    getDoctorsFromCSVFile(req, res);
  }
});

const getDoctorsFromCSVFile = (req, res) => {
  const csvFilePath = './doctors_processed_data.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: 'CSV data file not found' });
  }

  const results = [];
  
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', () => {
      // Remove header row and filter valid entries
      const doctors = results.filter(doctor => 
        doctor['Doctor ID'] && 
        doctor['Doctor Name'] && 
        doctor['Doctor ID'] !== 'Doctor ID'
      );
      
      res.json({
        doctors: doctors.map(doctor => ({
          doctor_id: doctor['Doctor ID'],
          doctor_name: doctor['Doctor Name'],
          education: doctor['Education'] ? JSON.parse(doctor['Education']) : [],
          speciality: doctor['Speciality'],
          experience: doctor['Experience'] ? parseInt(doctor['Experience']) : null,
          chamber: doctor['Chamber'],
          location: doctor['Location'],
          concentration: doctor['Concentration'] ? JSON.parse(doctor['Concentration']) : [],
          certifications: {
            MBBS: doctor['MBBS'] === '1',
            FCPS: doctor['FCPS'] === '1',
            BCS: doctor['BCS'] === '1',
            MD: doctor['MD'] === '1',
            MS: doctor['MS'] === '1',
            MCPS: doctor['MCPS'] === '1',
            CCD: doctor['CCD'] === '1',
            PGT: doctor['PGT'] === '1',
            BDS: doctor['BDS'] === '1',
            MPH: doctor['MPH'] === '1'
          },
          specializations: {
            gynae_problems: doctor['Gynae Problems'] === '1',
            cardiac_medicine: doctor['Cardiac Medicine'] === '1',
            general_medicine: doctor['General Medicine'] === '1',
            aesthetic_medicine: doctor['Aesthetic Medicine'] === '1',
            adolescent_medicine: doctor['Adolescent Medicine'] === '1',
            infectious_diseases: doctor['Infectious Diseases'] === '1',
            geriatric_medicine: doctor['Geriatric Medicine'] === '1',
            pcos: doctor['Polycystic Ovary Syndrome (Pcos)'] === '1',
            hormone_disturbances: doctor['Hormone Dirtubances'] === '1',
            pediatric_health_checkup: doctor['Health Checkup (Pediatric)'] === '1'
          }
        })),
        total: doctors.length
      });
    })
    .on('error', (error) => {
      res.status(500).json({ error: 'Error reading CSV file' });
    });
};

module.exports = {
  registerPatient,
  loginPatient,
  getDoctors,
  getDoctorsFromCSV,
  getDoctorAvailability,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment
};
