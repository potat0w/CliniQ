const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(admin.admin_id, 'admin');

  res.json({
    message: 'Login successful',
    admin: {
      id: admin.admin_id,
      name: admin.name,
      email: admin.email
    },
    token
  });
});

const getAllDoctors = asyncHandler(async (req, res) => {
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      *,
      chambers (
        id,
        name,
        address,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(doctors);
});

const createDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, phone, specialty, experienceYears, chamberId } = req.body;

  const { data: existingDoctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('email', email)
    .single();

  if (existingDoctor) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: doctor, error } = await supabase
    .from('doctors')
    .insert([{
      name,
      email,
      password: hashedPassword,
      phone,
      specialty,
      experience_years: experienceYears,
      chamber_id: chamberId,
      is_active: true
    }])
    .select(`
      *,
      chambers (
        id,
        name,
        address,
        phone
      )
    `)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    message: 'Doctor created successfully',
    doctor
  });
});

const updateDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { name, email, phone, specialty, experienceYears, chamberId, isActive } = req.body;

  const { data: existingDoctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('email', email)
    .neq('id', doctorId)
    .single();

  if (existingDoctor) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const { data: doctor, error } = await supabase
    .from('doctors')
    .update({
      name,
      email,
      phone,
      specialty,
      experience_years: experienceYears,
      chamber_id: chamberId,
      is_active: isActive
    })
    .eq('id', doctorId)
    .select(`
      *,
      chambers (
        id,
        name,
        address,
        phone
      )
    `)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    message: 'Doctor updated successfully',
    doctor
  });
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const { error } = await supabase
    .from('doctors')
    .delete()
    .eq('id', doctorId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Doctor deleted successfully' });
});

const getAllPatients = asyncHandler(async (req, res) => {
  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(patients);
});

const getPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (error || !patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  res.json(patient);
});

const updatePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { name, email, phone, age, gender } = req.body;

  const { data: existingPatient } = await supabase
    .from('patients')
    .select('patient_id')
    .eq('patient_id', patientId)
    .single();

  if (!existingPatient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const { data: patient, error } = await supabase
    .from('patients')
    .update({
      name,
      email,
      phone,
      age,
      gender
    })
    .eq('patient_id', patientId)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    message: 'Patient updated successfully',
    patient
  });
});

const deletePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Patient deleted successfully' });
});

const getAllChambers = asyncHandler(async (req, res) => {
  const { data: chambers, error } = await supabase
    .from('chambers')
    .select(`
      *,
      doctors (
        id,
        name,
        specialty
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(chambers);
});

const createChamber = asyncHandler(async (req, res) => {
  const { name, address, phone, email } = req.body;

  const { data: chamber, error } = await supabase
    .from('chambers')
    .insert([{
      name,
      address,
      phone,
      email
    }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    message: 'Chamber created successfully',
    chamber
  });
});

const updateChamber = asyncHandler(async (req, res) => {
  const { chamberId } = req.params;
  const { name, address, phone, email } = req.body;

  const { data: chamber, error } = await supabase
    .from('chambers')
    .update({
      name,
      address,
      phone,
      email
    })
    .eq('id', chamberId)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    message: 'Chamber updated successfully',
    chamber
  });
});

const deleteChamber = asyncHandler(async (req, res) => {
  const { chamberId } = req.params;

  const { data: doctors } = await supabase
    .from('doctors')
    .select('id')
    .eq('chamber_id', chamberId);

  if (doctors && doctors.length > 0) {
    return res.status(400).json({ error: 'Cannot delete chamber with assigned doctors' });
  }

  const { error } = await supabase
    .from('chambers')
    .delete()
    .eq('id', chamberId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Chamber deleted successfully' });
});

const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query;

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients (
        id,
        name,
        phone
      ),
      doctors (
        id,
        name,
        specialty
      )
    `)
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (date) {
    query = query.eq('appointment_date', date);
  }

  const { data: appointments, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(appointments);
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    { count: totalPatients },
    { count: totalDoctors },
    { count: totalChambers },
    { count: todayAppointments },
    { count: pendingAppointments }
  ] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact' }),
    supabase.from('doctors').select('id', { count: 'exact' }),
    supabase.from('chambers').select('id', { count: 'exact' }),
    supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('appointment_date', new Date().toISOString().split('T')[0]),
    supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .in('status', ['scheduled', 'rescheduled'])
      .gte('appointment_date', new Date().toISOString().split('T')[0])
  ]);

  res.json({
    totalPatients: totalPatients || 0,
    totalDoctors: totalDoctors || 0,
    totalChambers: totalChambers || 0,
    todayAppointments: todayAppointments || 0,
    pendingAppointments: pendingAppointments || 0
  });
});

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const { data: existingAdmin } = await supabase
    .from('admins')
    .select('admin_id')
    .eq('email', email)
    .single();

  if (existingAdmin) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: admin, error } = await supabase
    .from('admins')
    .insert([{
      name,
      email,
      password: hashedPassword
    }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const token = generateToken(admin.admin_id, 'admin');

  res.status(201).json({
    message: 'Admin registered successfully',
    admin: {
      id: admin.admin_id,
      name: admin.name,
      email: admin.email
    },
    token
  });
});

module.exports = {
  loginAdmin,
  registerAdmin,
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllPatients,
  getPatient,
  updatePatient,
  deletePatient,
  getAllChambers,
  createChamber,
  updateChamber,
  deleteChamber,
  getAllAppointments,
  getDashboardStats
};
