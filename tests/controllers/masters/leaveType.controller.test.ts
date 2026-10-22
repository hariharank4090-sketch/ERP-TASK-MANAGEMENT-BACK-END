import { describe, it, expect, vi } from 'vitest';
import {
  getAllLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  getLeaveTypeDropdown,
} from '../../../src/controllers/masters/taskManagement/leaveType.controller';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Leave Type Controller', () => {
  it('exposes leave type handlers', () => {
    expect(typeof getAllLeaveTypes).toBe('function');
    expect(typeof getLeaveTypeById).toBe('function');
    expect(typeof createLeaveType).toBe('function');
    expect(typeof updateLeaveType).toBe('function');
    expect(typeof deleteLeaveType).toBe('function');
    expect(typeof getLeaveTypeDropdown).toBe('function');
  });

  it('handles invalid ID in getLeaveTypeById', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = { params: { id: '-1' } } as unknown as Request;
    const res = mockResponse();

    await getLeaveTypeById(req, res);

    expect([400, 500]).toContain(res.status.mock.calls[0][0]);
    consoleSpy.mockRestore();
  });
});
