import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app.js';

import jwt from 'jsonwebtoken';
const testToken = jwt.sign(
    { userId: 999999 },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
);


test('GET / should return the welcome message', async () => {
    const response = await request(app).get('/');

    assert.equal(response.status, 200);
    assert.equal(
        response.body.message,
        'Welcome to Sweety - Blood Glucose Tracker'
    );
});

test('GET /api/auth/profile should reject unauthenticated requests', async () => {
    const response = await request(app).get('/api/auth/profile');

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(
        response.body.message,
        'Access denied. Please login first.'
    );
});

test('GET /api/glucose should reject unauthenticated requests', async () => {
    const response = await request(app).get('/api/glucose');

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(
        response.body.message,
        'Access denied. Please login first.'
    );
});



test('GET /api/auth/profile should reject an invalid token', async () => {
    const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(
        response.body.message,
        'Invalid authentication token.'
    );
});

test('GET /api/glucose should reject an invalid token', async () => {
    const response = await request(app)
        .get('/api/glucose')
        .set('Authorization', 'Bearer invalid-token');

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.equal(
        response.body.message,
        'Invalid authentication token.'
    );
});



test('POST /api/glucose should reject a missing glucose value', async () => {
    const response = await request(app)
        .post('/api/glucose')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            reading_date: '2026-11-09',
            time_slot: 'Morning (fasting)'
        });

    assert.equal(response.status, 400);
    assert.equal(
        response.body.message,
        'Please enter a glucose value.'
    );
});

test('POST /api/glucose should reject a value below 40', async () => {
    const response = await request(app)
        .post('/api/glucose')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            reading_date: '2026-11-09',
            time_slot: 'Morning (fasting)',
            glucose_value: 39
        });

    assert.equal(response.status, 400);
    assert.equal(
        response.body.message,
        'Value must be between 40 and 600 mg/dl.'
    );
});

test('POST /api/glucose should reject a value above 600', async () => {
    const response = await request(app)
        .post('/api/glucose')
       .set('Authorization', `Bearer ${testToken}`)
        .send({
            reading_date: '2026-11-09',
            time_slot: 'Morning (fasting)',
            glucose_value: 601
        });

    assert.equal(response.status, 400);
    assert.equal(
        response.body.message,
        'Value must be between 40 and 600 mg/dl.'
    );
});

test('POST /api/glucose should reject decimal values', async () => {
    const response = await request(app)
        .post('/api/glucose')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            reading_date: '2026-11-09',
            time_slot: 'Morning (fasting)',
            glucose_value: 100.5
        });

    assert.equal(response.status, 400);
    assert.equal(
        response.body.message,
        'Value must be between 40 and 600 mg/dl.'
    );
});


test('POST /api/glucose should reject a missing date', async () => {
    const response = await request(app)
        .post('/api/glucose')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            time_slot: 'Morning (fasting)',
            glucose_value: 100
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Please select a date.');
});

test('POST /api/glucose should reject an invalid date', async () => {
    const response = await request(app)
        .post('/api/glucose')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            reading_date: 'invalid-date',
            time_slot: 'Morning (fasting)',
            glucose_value: 100
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Please enter a valid date.');
});

test('POST /api/glucose should reject an invalid time slot', async () => {
    const response = await request(app)
        .post('/api/glucose')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            reading_date: '2026-11-09',
            time_slot: 'Afternoon',
            glucose_value: 100
        });

    assert.equal(response.status, 400);
    assert.equal(
        response.body.message,
        'Please select a valid time slot.'
    );
});
