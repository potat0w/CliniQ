const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const signupDoctor = asyncHandler(async (req, res) => {
  const { doctorId, email, password } = req.body;

  if (!doctorId || !email || !password) {
    return res.status(400).json({ error: 'Doctor ID, email, and password are required' });
  }

  const { data: doctor, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('doctor_id', doctorId)
    .single();

  if (error || !doctor) {
    return res.status(404).json({ error: 'Doctor ID not found' });
  }

  if (doctor.email && doctor.password) {
    return res.status(400).json({ error: 'Doctor already has credentials set up' });
  }

  const { data: existingEmail } = await supabase
    .from('doctors')
    .select('doctor_id')
    .eq('email', email)
    .neq('doctor_id', doctorId)
    .single();

  if (existingEmail) {
    return res.status(400).json({ error: 'Email already registered with another doctor' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: updatedDoctor, error: updateError } = await supabase
    .from('doctors')
    .update({
      email,
      password: hashedPassword
    })
    .eq('doctor_id', doctorId)
    .select()
    .single();

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  const token = generateToken(updatedDoctor.doctor_id, 'doctor');

  res.status(201).json({
    message: 'Doctor signup successful',
    doctor: {
      id: updatedDoctor.doctor_id,
      name: updatedDoctor.doctor_name,
      email: updatedDoctor.email,
      phone: updatedDoctor.phone,
      specialty: updatedDoctor.speciality,
      experience_years: updatedDoctor.experience
    },
    token
  });
});

const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data: doctor, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !doctor) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!doctor.password) {
    return res.status(401).json({ error: 'Please complete signup first' });
  }

  const isPasswordValid = await bcrypt.compare(password, doctor.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(doctor.doctor_id, 'doctor');

  res.json({
    message: 'Login successful',
    doctor: {
      id: doctor.doctor_id,
      name: doctor.doctor_name,
      email: doctor.email,
      specialty: doctor.speciality,
      experience_years: doctor.experience
    },
    token
  });
});

const getUpcomingAppointments = asyncHandler(async (req, res) => {
  const doctorId = req.user.userId;

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (
        id,
        name,
        phone,
        age,
        gender
      )
    `)
    .eq('doctor_id', doctorId)
    .in('status', ['scheduled', 'rescheduled'])
    .gte('appointment_date', new Date().toISOString().split('T')[0])
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(appointments);
});

const getAppointmentHistory = asyncHandler(async (req, res) => {
  const doctorId = req.user.userId;

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (
        id,
        name,
        phone,
        age,
        gender
      )
    `)
    .eq('doctor_id', doctorId)
    .in('status', ['completed', 'cancelled'])
    .order('appointment_date', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(appointments);
});

const getPatientHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const doctorId = req.user.userId;

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (
        id,
        name,
        phone,
        age,
        gender,
        address
      )
    `)
    .eq('doctor_id', doctorId)
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (appointments.length === 0) {
    return res.status(404).json({ error: 'No appointments found for this patient' });
  }

  res.json({
    patient: appointments[0].patients,
    appointments
  });
});

const addAvailability = asyncHandler(async (req, res) => {
  const { dayOfWeek, startTime, endTime, fee, chamberId } = req.body;
  const doctorId = req.user.userId;

  const { data: availability, error } = await supabase
    .from('slots')
    .insert([{
      doctor_id: doctorId,
      chamber_id: chamberId || 1,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      fee: fee || 1000,
      status: 'available'
    }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    message: 'Slot added successfully',
    availability
  });
});

const getAvailability = asyncHandler(async (req, res) => {
  const doctorId = req.user.userId;

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

const updateAvailability = asyncHandler(async (req, res) => {
  const { availabilityId } = req.params;
  const { isAvailable } = req.body;
  const doctorId = req.user.userId;

  const { data: availability, error } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('id', availabilityId)
    .eq('doctor_id', doctorId)
    .single();

  if (error || !availability) {
    return res.status(404).json({ error: 'Availability not found' });
  }

  const { data: updatedAvailability, error: updateError } = await supabase
    .from('doctor_availability')
    .update({ is_available: isAvailable })
    .eq('id', availabilityId)
    .select()
    .single();

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  res.json({
    message: 'Availability updated successfully',
    availability: updatedAvailability
  });
});

const deleteAvailability = asyncHandler(async (req, res) => {
  const { availabilityId } = req.params;
  const doctorId = req.user.userId;

  const { data: availability, error } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('id', availabilityId)
    .eq('doctor_id', doctorId)
    .single();

  if (error || !availability) {
    return res.status(404).json({ error: 'Availability not found' });
  }

  if (!availability.is_available) {
    return res.status(400).json({ error: 'Cannot delete availability that is already booked' });
  }

  const { error: deleteError } = await supabase
    .from('doctor_availability')
    .delete()
    .eq('id', availabilityId);

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message });
  }

  res.json({ message: 'Availability deleted successfully' });
});

const completeAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const doctorId = req.user.userId;

  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .eq('doctor_id', doctorId)
    .single();

  if (fetchError || !appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (appointment.status !== 'scheduled' && appointment.status !== 'rescheduled') {
    return res.status(400).json({ error: 'Cannot complete this appointment' });
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', appointmentId);

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  res.json({ message: 'Appointment marked as completed' });
});

module.exports = {
  signupDoctor,
  loginDoctor,
  getUpcomingAppointments,
  getAppointmentHistory,
  getPatientHistory,
  addAvailability,
  getAvailability,
  updateAvailability,
  deleteAvailability,
  completeAppointment
};
