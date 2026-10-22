import { describe, it, expect, vi } from 'vitest';
import {
  addAttendance,
  closeAttendance,
  getAttendanceStats,
} from '../../../src/controllers/Attendace/salesperson.controller';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Salesperson Attendance Controller', () => {
  it('handles addAttendance error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = { body: {} } as Request;
    const res = mockResponse();

    await addAttendance(req, res);

    expect([400, 500]).toContain(res.status.mock.calls[0][0]);
    consoleSpy.mockRestore();
  });

  it('exposes closeAttendance and getAttendanceStats handlers', () => {
    expect(typeof closeAttendance).toBe('function');
    expect(typeof getAttendanceStats).toBe('function');
  });
});
