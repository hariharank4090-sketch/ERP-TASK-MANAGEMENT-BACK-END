import { describe, it, expect, vi } from 'vitest';
import {
  getAllWorks,
  getWorkById,
  createWork,
  updateWork,
  deleteWork,
} from '../../../src/controllers/masters/taskManagement/workMaster.controller';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Work Master Controller', () => {
  it('exposes work master CRUD handlers', () => {
    expect(typeof getAllWorks).toBe('function');
    expect(typeof getWorkById).toBe('function');
    expect(typeof createWork).toBe('function');
    expect(typeof updateWork).toBe('function');
    expect(typeof deleteWork).toBe('function');
  });

  it('handles invalid ID in getWorkById', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = { params: { id: 'invalid' } } as unknown as Request;
    const res = mockResponse();

    await getWorkById(req, res);

    expect([400, 500]).toContain(res.status.mock.calls[0][0]);
    consoleSpy.mockRestore();
  });
});
