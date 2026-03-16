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
      doctor_id,
      doctor_name,
      email,
      speciality,
      experience
    `)
    .eq('email', 'is not', null);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(doctors);
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

  res.json(availability);
});

const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, slotId, notes } = req.body;
  const patientId = req.user.userId;

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
      chamber_id: slot.chamber_id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      patient_name: patient.name,
      patient_phone: patient.phone,
      status: 'scheduled'
    }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  await supabase
    .from('slots')
    .update({ status: 'booked' })
    .eq('slot_id', slotId);

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
      )
    `)
    .eq('patient_name', (
      supabase
        .from('patients')
        .select('name')
        .eq('patient_id', patientId)
        .single()
    ))
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
