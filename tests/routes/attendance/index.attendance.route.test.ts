import { describe, it, expect } from 'vitest';
import attendanceRoutes from '../../../src/routes/attendance/index.attendance.route';

describe('Attendance Index Route', () => {
  it('mounts attendance subroutes', () => {
    expect(attendanceRoutes).toBeDefined();
    expect(attendanceRoutes.stack.length).toBeGreaterThanOrEqual(3);
  });
});
