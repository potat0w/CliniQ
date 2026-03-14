const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
      id,
      name,
      email,
      phone,
      specialty,
      experience_years,
      chamber_id,
      chambers (
        id,
        name,
        address,
        phone
      )
    `)
    .eq('is_active', true);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(doctors);
});

const getDoctorAvailability = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const { data: availability, error } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('is_available', true)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(availability);
});

const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, availabilityId, notes } = req.body;
  const patientId = req.user.userId;

  const { data: availability, error: availabilityError } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('id', availabilityId)
    .eq('doctor_id', doctorId)
    .eq('is_available', true)
    .single();

  if (availabilityError || !availability) {
    return res.status(400).json({ error: 'Time slot not available' });
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert([{
      patient_id: patientId,
      doctor_id: doctorId,
      availability_id: availabilityId,
      appointment_date: availability.date,
      start_time: availability.start_time,
      end_time: availability.end_time,
      status: 'scheduled',
      notes
    }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  await supabase
    .from('doctor_availability')
    .update({ is_available: false })
    .eq('id', availabilityId);

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
        id,
        name,
        specialty,
        phone
      )
    `)
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true });

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

module.exports = {
  registerPatient,
  loginPatient,
  getDoctors,
  getDoctorAvailability,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment
};
