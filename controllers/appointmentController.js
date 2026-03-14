const supabase = require('../config/db');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, date, doctorId, patientId } = req.query;

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients (
        id,
        name,
        phone,
        email
      ),
      doctors (
        id,
        name,
        specialty,
        phone
      ),
      chambers (
        id,
        name,
        address
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

  if (doctorId) {
    query = query.eq('doctor_id', doctorId);
  }

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data: appointments, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(appointments);
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (
        id,
        name,
        phone,
        email,
        age,
        gender,
        address
      ),
      doctors (
        id,
        name,
        specialty,
        phone,
        experience_years,
        chambers (
          id,
          name,
          address,
          phone
        )
      )
    `)
    .eq('id', appointmentId)
    .single();

  if (error || !appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  res.json(appointment);
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ['scheduled', 'rescheduled', 'completed', 'cancelled', 'no-show'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (fetchError || !appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const updateData = { status };
  
  if (notes !== undefined) {
    updateData.notes = notes;
  }

  const { data: updatedAppointment, error: updateError } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)
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
    .single();

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  if (status === 'cancelled' && appointment.status !== 'cancelled') {
    await supabase
      .from('doctor_availability')
      .update({ is_available: true })
      .eq('id', appointment.availability_id);
  }

  res.json({
    message: 'Appointment status updated successfully',
    appointment: updatedAppointment
  });
});

const getAppointmentsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate, doctorId } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

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
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (doctorId) {
    query = query.eq('doctor_id', doctorId);
  }

  const { data: appointments, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(appointments);
});

const getTodayAppointments = asyncHandler(async (req, res) => {
  const { doctorId } = req.query;
  const today = new Date().toISOString().split('T')[0];

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
    .eq('appointment_date', today)
    .order('start_time', { ascending: true });

  if (doctorId) {
    query = query.eq('doctor_id', doctorId);
  }

  const { data: appointments, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(appointments);
});

const getAppointmentStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate, doctorId } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  let baseQuery = supabase
    .from('appointments')
    .select('status')
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate);

  if (doctorId) {
    baseQuery = baseQuery.eq('doctor_id', doctorId);
  }

  const { data: appointments, error } = await baseQuery;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const statistics = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    rescheduled: appointments.filter(a => a.status === 'rescheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    'no-show': appointments.filter(a => a.status === 'no-show').length
  };

  res.json(statistics);
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (fetchError || !appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (appointment.status === 'completed') {
    return res.status(400).json({ error: 'Cannot delete completed appointment' });
  }

  const { error: deleteError } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message });
  }

  if (appointment.availability_id) {
    await supabase
      .from('doctor_availability')
      .update({ is_available: true })
      .eq('id', appointment.availability_id);
  }

  res.json({ message: 'Appointment deleted successfully' });
});

module.exports = {
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAppointmentsByDateRange,
  getTodayAppointments,
  getAppointmentStatistics,
  deleteAppointment
};
