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

const importDoctorsFromCSV = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const results = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      try {
        const doctorsToInsert = [];
        
        for (const doctor of results) {
          // Skip header row
          if (doctor['Doctor ID'] === '1' || !doctor['Doctor Name']) {
            continue;
          }

          // Validate required fields
          if (!doctor['Doctor Name'] || !doctor['Speciality']) {
            errors.push(`Missing required fields for: ${doctor['Doctor Name'] || 'Unknown'}`);
            continue;
          }

          // Create email from name if not present
          let email = doctor['Email'] || '';
          if (!email && doctor['Doctor Name']) {
            const name = doctor['Doctor Name'].replace(/[^a-zA-Z\s]/g, '').toLowerCase().replace(/\s+/g, '.');
            email = `${name}@hospital.com`;
          }

          // Check if doctor already exists
          const { data: existingDoctor } = await supabase
            .from('doctors')
            .select('doctor_id')
            .eq('email', email)
            .single();

          if (existingDoctor) {
            errors.push(`Doctor with email ${email} already exists`);
            continue;
          }

          doctorsToInsert.push({
            doctor_name: doctor['Doctor Name'],
            email: email,
            speciality: doctor['Speciality'],
            experience: doctor['Experience'] ? parseInt(doctor['Experience']) : null,
            chamber: doctor['Chamber'] || null,
            location: doctor['Location'] || null
          });
        }

        if (doctorsToInsert.length > 0) {
          const { data: insertedDoctors, error: insertError } = await supabase
            .from('doctors')
            .insert(doctorsToInsert)
            .select();

          if (insertError) {
            return res.status(400).json({ error: insertError.message });
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          message: `Successfully imported ${doctorsToInsert.length} doctors`,
          imported: doctorsToInsert.length,
          errors: errors.length,
          errorDetails: errors
        });

      } catch (error) {
        // Clean up uploaded file on error
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message });
      }
    });
});

const getDoctorsFromCSV = asyncHandler(async (req, res) => {
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
  getDashboardStats,
  importDoctorsFromCSV,
  getDoctorsFromCSV
};
