const request = require('supertest');
const app = require('../server');

describe('Patient Signup', () => {
  test('should register a new patient successfully', async () => {
    const patientData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '+1234567890',
      age: 30,
      gender: 'male',
      address: '123 Main St, City, State'
    };

    const response = await request(app)
      .post('/api/patients/register')
      .send(patientData)
      .expect(201);

    expect(response.body.message).toBe('Patient registered successfully');
    expect(response.body.patient.email).toBe(patientData.email);
    expect(response.body.patient.name).toBe(patientData.name);
    expect(response.body.token).toBeDefined();
  });

  test('should not register patient with existing email', async () => {
    const patientData = {
      name: 'Jane Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '+1234567891',
      age: 25,
      gender: 'female',
      address: '456 Oak St, City, State'
    };

    const response = await request(app)
      .post('/api/patients/register')
      .send(patientData)
      .expect(400);

    expect(response.body.error).toBe('Email already registered');
  });

  test('should not register patient with invalid data', async () => {
    const invalidData = {
      name: '',
      email: 'invalid-email',
      password: '123',
      phone: '',
      age: 'invalid',
      gender: 'invalid'
    };

    const response = await request(app)
      .post('/api/patients/register')
      .send(invalidData)
      .expect(400);

    expect(response.body.error).toBeDefined();
  });
});

describe('Patient Login', () => {
  test('should login patient with valid credentials', async () => {
    const loginData = {
      email: 'john.doe@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/patients/login')
      .send(loginData)
      .expect(200);

    expect(response.body.message).toBe('Login successful');
    expect(response.body.patient.email).toBe(loginData.email);
    expect(response.body.token).toBeDefined();
  });

  test('should not login patient with invalid credentials', async () => {
    const loginData = {
      email: 'john.doe@example.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/patients/login')
      .send(loginData)
      .expect(401);

    expect(response.body.error).toBe('Invalid credentials');
  });

  test('should not login non-existent patient', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/patients/login')
      .send(loginData)
      .expect(401);

    expect(response.body.error).toBe('Invalid credentials');
  });
});

describe('Doctor Signup', () => {
  test('should signup doctor with valid doctor ID and credentials', async () => {
    const doctorData = {
      doctorId: 'test-doctor-123',
      email: 'doctor@test.com',
      password: 'doctorpass123'
    };

    const response = await request(app)
      .post('/api/doctors/signup')
      .send(doctorData)
      .expect(201);

    expect(response.body.message).toBe('Doctor signup successful');
    expect(response.body.doctor.email).toBe(doctorData.email);
    expect(response.body.token).toBeDefined();
  });

  test('should not signup doctor with invalid doctor ID', async () => {
    const doctorData = {
      doctorId: 'invalid-doctor-id',
      email: 'doctor2@test.com',
      password: 'doctorpass123'
    };

    const response = await request(app)
      .post('/api/doctors/signup')
      .send(doctorData)
      .expect(404);

    expect(response.body.error).toBe('Doctor ID not found');
  });

  test('should not signup doctor with missing fields', async () => {
    const invalidData = {
      doctorId: 'test-doctor-123',
      email: 'doctor3@test.com'
    };

    const response = await request(app)
      .post('/api/doctors/signup')
      .send(invalidData)
      .expect(400);

    expect(response.body.error).toBe('Doctor ID, email, and password are required');
  });

  test('should not signup doctor with already set credentials', async () => {
    const doctorData = {
      doctorId: 'test-doctor-123',
      email: 'doctor4@test.com',
      password: 'doctorpass123'
    };

    const response = await request(app)
      .post('/api/doctors/signup')
      .send(doctorData)
      .expect(400);

    expect(response.body.error).toBe('Doctor already has credentials set up');
  });
});

describe('Doctor Login', () => {
  test('should login doctor with valid credentials', async () => {
    const loginData = {
      email: 'doctor@test.com',
      password: 'doctorpass123'
    };

    const response = await request(app)
      .post('/api/doctors/login')
      .send(loginData)
      .expect(200);

    expect(response.body.message).toBe('Login successful');
    expect(response.body.doctor.email).toBe(loginData.email);
    expect(response.body.token).toBeDefined();
  });

  test('should not login doctor with invalid credentials', async () => {
    const loginData = {
      email: 'doctor@test.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/doctors/login')
      .send(loginData)
      .expect(401);

    expect(response.body.error).toBe('Invalid credentials');
  });

  test('should not login non-existent doctor', async () => {
    const loginData = {
      email: 'nonexistent@doctor.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/doctors/login')
      .send(loginData)
      .expect(401);

    expect(response.body.error).toBe('Invalid credentials');
  });

  test('should not login doctor without password set', async () => {
    const loginData = {
      email: 'doctor-no-pass@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/doctors/login')
      .send(loginData)
      .expect(401);

    expect(response.body.error).toBe('Please complete signup first');
  });
});

describe('Health Check', () => {
  test('should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.uptime).toBeDefined();
  });
});
