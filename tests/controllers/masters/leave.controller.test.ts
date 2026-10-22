import { describe, it, expect, vi } from 'vitest';
import {
  getLeaveList,
  getLeaveById,
  applyLeave,
  updateLeave,
  deleteLeave,
  getStatusOptions,
} from '../../../src/controllers/masters/taskManagement/leave.controller';
import type { Request, Response } from 'express';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe('Leave Controller', () => {
  it('exposes leave handlers', () => {
    expect(typeof getLeaveList).toBe('function');
    expect(typeof getLeaveById).toBe('function');
    expect(typeof applyLeave).toBe('function');
    expect(typeof updateLeave).toBe('function');
    expect(typeof deleteLeave).toBe('function');
    expect(typeof getStatusOptions).toBe('function');
  });

  it('returns status options via getStatusOptions', async () => {
    const req = {} as Request;
    const res = mockResponse();

    await getStatusOptions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
