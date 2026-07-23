const request = require('supertest');
const app = require('../src/app');

describe('Health Check Endpoint', () => {
  it('GET /api/v1/health - should return 200 with server health data', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'healthy');
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data).toHaveProperty('database');
  });

  it('GET /api/v1/version - should return 200 with version info', async () => {
    const res = await request(app).get('/api/v1/version');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('version', 'v1');
  });

  it('GET /api/v1/unknown - should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint-xyz');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
