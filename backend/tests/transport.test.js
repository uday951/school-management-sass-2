const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

describe('Transport Module API Integration Tests', () => {
  let vehicleId = null;
  let driverId = null;
  let routeId = null;
  let stopId = null;
  let allocationId = null;
  let mockStudentId = null;

  beforeAll(async () => {
    // Generate a mock student record for allocation validation
    const Student = mongoose.model('Student');
    const student = await Student.create({
      admissionNo: `TEST-ADM-${Date.now()}`,
      admissionDate: new Date(),
      rollNo: 'TS-99',
      firstName: 'Transport',
      lastName: 'Student',
      dob: new Date(2012, 1, 1),
      gender: 'male',
      class: 'Grade 10',
      section: 'A'
    });
    mockStudentId = student._id.toString();
  });

  it('POST /api/v1/transport/vehicles - should register a new vehicle', async () => {
    const res = await request(app)
      .post('/api/v1/transport/vehicles')
      .send({
        vehicleNo: `VEH-${Math.floor(1000 + Math.random() * 9000)}`,
        registrationNo: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
        capacity: 40,
        manufacturer: 'Tata Motors',
        model: 'Starbus 2026',
        insuranceNo: 'INS-998811',
        insuranceExpiry: '2027-12-31'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    vehicleId = res.body.data._id;
  });

  it('GET /api/v1/transport/vehicles - should list vehicles', async () => {
    const res = await request(app).get('/api/v1/transport/vehicles');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/transport/drivers - should create a new driver', async () => {
    const res = await request(app)
      .post('/api/v1/transport/drivers')
      .send({
        name: 'John Doe Driver',
        licenseNo: `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
        licenseExpiry: '2029-06-30',
        phone: '555-019-2834',
        assignedVehicle: vehicleId
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    driverId = res.body.data._id;
  });

  it('POST /api/v1/transport/routes - should create a travel route', async () => {
    const res = await request(app)
      .post('/api/v1/transport/routes')
      .send({
        routeName: 'Sector 5 Express',
        routeCode: `R-${Math.floor(100 + Math.random() * 900)}`,
        distance: 12.5,
        estimatedTime: '45 mins',
        assignedVehicle: vehicleId,
        assignedDriver: driverId
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    routeId = res.body.data._id;
  });

  it('POST /api/v1/transport/stops - should add a stop to route sequence', async () => {
    const res = await request(app)
      .post('/api/v1/transport/stops')
      .send({
        routeId,
        stopName: 'Central Square Mall',
        pickupTime: '07:30 AM',
        dropTime: '02:30 PM',
        sequenceOrder: 1
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    stopId = res.body.data._id;
  });

  it('POST /api/v1/transport/allocations - should allocate student and trigger billing sync', async () => {
    const res = await request(app)
      .post('/api/v1/transport/allocations')
      .send({
        studentId: mockStudentId,
        routeId,
        pickupStopId: stopId,
        dropStopId: stopId
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    allocationId = res.body.data._id;

    // Verify auto-billing sync
    const StudentFee = mongoose.model('StudentFee');
    const feeInvoice = await StudentFee.findOne({ studentId: mockStudentId, isDeleted: false });
    expect(feeInvoice).not.toBeNull();
    expect(feeInvoice.amount).toBe(1500);
  });

  it('GET /api/v1/transport/dashboard-stats - should fetch dashboard statistics', async () => {
    const res = await request(app).get('/api/v1/transport/dashboard-stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalVehicles');
    expect(res.body.data).toHaveProperty('activeVehicles');
    expect(res.body.data).toHaveProperty('fuelCost');
  });
});
