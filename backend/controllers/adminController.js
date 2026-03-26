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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { specialty } = req.query;

  try {
    // For large page numbers, use cursor-based pagination to avoid timeout
    if (page > 500) {
      // Use a simpler query without joins for large pages
      let simpleQuery = supabase
        .from('doctors')
        .select('doctor_id, doctor_name, email, speciality, experience', { count: 'exact' });

      if (specialty && specialty !== 'all') {
        simpleQuery = simpleQuery.eq('speciality', specialty);
      }

      const { count, error: countError } = await simpleQuery;
      
      if (countError) {
        return res.status(400).json({ error: countError.message });
      }

      // Get paginated data without joins for large pages
      const { data: doctors, error } = await simpleQuery
        .order('doctor_id', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const totalPages = Math.ceil(count / limit);

      res.json({
        data: doctors,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      });
      return;
    }

    // Build base query for count (for smaller pages)
    let countQuery = supabase
      .from('doctors')
      .select('*', { count: 'exact' });

    // Build base query for data
    let dataQuery = supabase
      .from('doctors')
      .select(`
        *,
        chambers (
          chamber_id,
          chamber_name,
          location
        )
      `);

    // Apply specialty filter if provided
    if (specialty && specialty !== 'all') {
      countQuery = countQuery.eq('speciality', specialty);
      dataQuery = dataQuery.eq('speciality', specialty);
    }

    // Get total count with filter
    const { count, error: countError } = await countQuery;

    if (countError) {
      return res.status(400).json({ error: countError.message });
    }

    // Get paginated data with chamber information
    const { data: doctors, error } = await dataQuery
      .order('doctor_id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: doctors,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error in getAllDoctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
    .select('*')
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
    .select('doctor_id')
    .eq('email', email)
    .neq('doctor_id', doctorId)
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
    .eq('doctor_id', doctorId)
    .select('*')
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
    .eq('doctor_id', doctorId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Doctor deleted successfully' });
});

const getAllPatients = asyncHandler(async (req, res) => {
  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')
    .order('patient_id', { ascending: false });

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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Get total count
  const { count, error: countError } = await supabase
    .from('chambers')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    return res.status(400).json({ error: countError.message });
  }

  // Get paginated data
  const { data: chambers, error } = await supabase
    .from('chambers')
    .select('*')
    .order('chamber_id', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const totalPages = Math.ceil(count / limit);

  res.json({
    data: chambers,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalItems: count,
      itemsPerPage: limit
    }
  });
});

const createChamber = asyncHandler(async (req, res) => {
  const { chamber_name, location, doctor_id, specialties } = req.body;

  const { data: chamber, error } = await supabase
    .from('chambers')
    .insert([{
      chamber_name,
      location,
      doctor_id,
      specialties
    }])
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!chamber || chamber.length === 0) {
    return res.status(400).json({ error: 'Failed to create chamber' });
  }

  res.status(201).json({
    message: 'Chamber created successfully',
    chamber: chamber[0]
  });
});

const updateChamber = asyncHandler(async (req, res) => {
  const { chamberId } = req.params;
  const { chamber_name, location, doctor_id, specialties } = req.body;

  const { data: chamber, error } = await supabase
    .from('chambers')
    .update({
      chamber_name,
      location,
      doctor_id,
      specialties
    })
    .eq('chamber_id', chamberId)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!chamber || chamber.length === 0) {
    return res.status(404).json({ error: 'Chamber not found' });
  }

  res.json({
    message: 'Chamber updated successfully',
    chamber: chamber[0]
  });
});

const deleteChamber = asyncHandler(async (req, res) => {
  const { chamberId } = req.params;

  const { data: doctors } = await supabase
    .from('doctors')
    .select('doctor_id')
    .eq('chamber_id', chamberId);

  if (doctors && doctors.length > 0) {
    return res.status(400).json({ error: 'Cannot delete chamber with assigned doctors' });
  }

  const { error } = await supabase
    .from('chambers')
    .delete()
    .eq('chamber_id', chamberId);

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
        patient_id,
        name,
        email,
        phone
      ),
      doctors (
        doctor_id,
        doctor_name,
        speciality
      ),
      chambers (
        chamber_id,
        chamber_name,
        location
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
  try {
    const [
      { count: totalPatients },
      { count: totalDoctors },
      { count: totalChambers },
      { count: todayAppointments },
      { count: pendingAppointments }
    ] = await Promise.all([
      supabase.from('patients').select('patient_id', { count: 'exact' }),
      supabase.from('doctors').select('doctor_id', { count: 'exact' }),
      supabase.from('chambers').select('chamber_id', { count: 'exact' }),
      supabase
        .from('appointments')
        .select('appointment_id', { count: 'exact' })
        .eq('appointment_date', new Date().toISOString().split('T')[0]),
      supabase
        .from('appointments')
        .select('appointment_id', { count: 'exact' })
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
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
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

// Appointment CRUD operations
const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, chamberId, appointmentDate, startTime, endTime, status, paymentDone } = req.body;

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert([{
      patient_id: patientId,
      doctor_id: doctorId,
      chamber_id: chamberId,
      appointment_date: appointmentDate,
      start_time: startTime,
      end_time: endTime,
      status: status || 'scheduled',
      payment_done: paymentDone || false,
      booking_time: new Date().toISOString()
    }])
    .select(`
      *,
      patients (
        patient_id,
        name,
        email,
        phone
      ),
      doctors (
        doctor_id,
        doctor_name,
        speciality
      ),
      chambers (
        chamber_id,
        chamber_name,
        location
      )
    `)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    message: 'Appointment created successfully',
    appointment
  });
});

const updateAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { patientId, doctorId, chamberId, appointmentDate, startTime, endTime, status, paymentDone } = req.body;

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({
      patient_id: patientId,
      doctor_id: doctorId,
      chamber_id: chamberId,
      appointment_date: appointmentDate,
      start_time: startTime,
      end_time: endTime,
      status,
      payment_done: paymentDone
    })
    .eq('appointment_id', appointmentId)
    .select(`
      *,
      patients (
        patient_id,
        name,
        email,
        phone
      ),
      doctors (
        doctor_id,
        doctor_name,
        speciality
      ),
      chambers (
        chamber_id,
        chamber_name,
        location
      )
    `)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    message: 'Appointment updated successfully',
    appointment
  });
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('appointment_id', appointmentId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Appointment deleted successfully' });
});

// Admin CRUD operations
const getAllAdmins = asyncHandler(async (req, res) => {
  const { data: admins, error } = await supabase
    .from('admins')
    .select('admin_id, name, email')
    .order('admin_id', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(admins);
});

const getAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const { data: admin, error } = await supabase
    .from('admins')
    .select('admin_id, name, email')
    .eq('admin_id', adminId)
    .single();

  if (error || !admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  res.json(admin);
});

const updateAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const { name, email } = req.body;

  // Check if email is already used by another admin
  const { data: existingAdmin } = await supabase
    .from('admins')
    .select('admin_id')
    .eq('email', email)
    .neq('admin_id', adminId)
    .single();

  if (existingAdmin) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const { data: admin, error } = await supabase
    .from('admins')
    .update({ name, email })
    .eq('admin_id', adminId)
    .select('admin_id, name, email')
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    message: 'Admin updated successfully',
    admin
  });
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  // Prevent admin from deleting themselves
  if (adminId == req.user.userId) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('admin_id', adminId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Admin deleted successfully' });
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
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDashboardStats,
  importDoctorsFromCSV,
  getDoctorsFromCSV,
  getAllAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin
};
