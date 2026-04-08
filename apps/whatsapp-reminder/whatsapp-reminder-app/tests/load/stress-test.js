import { check, sleep } from 'k6';
import http from 'k6/http';

/**
 * Silicon Valley Load Test: Reminder Creation Stress
 * Targets 100 concurrent virtual users simulating high load.
 */
export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 50 },  // Ramp up to 50 users
        { duration: '2m', target: 100 }, // Stress peak: 100 users
        { duration: '30s', target: 0 },  // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be under 500ms
        http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:4000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN;

export default function () {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
    };

    // 1. Create a Reminder
    const payload = JSON.stringify({
        title: `Load Test Reminder ${Math.random()}`,
        message: 'High-performance load test message from k6',
        schedule: new Date(Date.now() + 600000).toISOString(), // 10 mins from now
        repeat: 'NONE',
    });

    const res = http.post(`${BASE_URL}/api/reminders`, payload, { headers });

    check(res, {
        'status is 201 or 200': (r) => r.status === 201 || r.status === 200,
        'has reminder id': (r) => r.json().data && r.json().data.id,
    });

    sleep(1);
}
