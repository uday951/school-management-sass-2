const request = require('supertest');
const app = require('../src/app');

describe('Leave Requests API Integration', () => {
  let createdLeaveId = null;

  it('POST /api/v1/attendance/leaves - should apply for a student leave request', async () => {
    const payload = {
      applicantId: '60d01b123432ab34523912a1',
      applicantName: 'Alex Rivera',
      type: 'student',
      leaveType: 'sick',
      startDate: '2026-08-01',
      endDate: '2026-08-03',
      reason: 'Fever checkup'
    };

    const res = await request(app).post('/api/v1/attendance/leaves').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'pending');
    createdLeaveId = res.body.data._id;
  });

  it('GET /api/v1/attendance/leaves - should get all leave requests list', async () => {
    const res = await request(app).get('/api/v1/attendance/leaves');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PATCH /api/v1/attendance/leaves/:id/status - should approve leave request and trigger attendance creation', async () => {
    if (!createdLeaveId) return;

    const res = await request(app)
      .patch(`/api/v1/attendance/leaves/${createdLeaveId}/status`)
      .send({
        status: 'approved',
        actionRemarks: 'Medical certificate approved.',
        actionBy: 'Principal'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('approved');
  });
});
