import { describe, it, expect, vi } from 'vitest';
import {
  getFingerprintAttendance,
  getAllDefaultLeaves,
  getAttendanceStats,
  attendanceSync,
} from '../../../src/controllers/Attendace/fingerPrintAttendance.controller';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Fingerprint Attendance Controller', () => {
  it('handles error in getFingerprintAttendance when database query fails or lacks parameters', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = { query: {} } as Request;
    const res = mockResponse();

    await getFingerprintAttendance(req, res);

    expect([400, 500]).toContain(res.status.mock.calls[0][0]);
    consoleSpy.mockRestore();
  });

  it('exposes getAllDefaultLeaves and getAttendanceStats handlers', () => {
    expect(typeof getAllDefaultLeaves).toBe('function');
    expect(typeof getAttendanceStats).toBe('function');
    expect(typeof attendanceSync).toBe('function');
  });
});
