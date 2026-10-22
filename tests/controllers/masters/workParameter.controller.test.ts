import { describe, it, expect, vi } from 'vitest';
import {
  getAllWorkParameters,
  getWorkParameterById,
  createWorkParameter,
  updateWorkParameter,
  deleteWorkParameter,
} from '../../../src/controllers/masters/taskManagement/workParameter.controller';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Work Parameter Controller', () => {
  it('exposes work parameter CRUD handlers', () => {
    expect(typeof getAllWorkParameters).toBe('function');
    expect(typeof getWorkParameterById).toBe('function');
    expect(typeof createWorkParameter).toBe('function');
    expect(typeof updateWorkParameter).toBe('function');
    expect(typeof deleteWorkParameter).toBe('function');
  });

  it('handles invalid ID in getWorkParameterById', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = { params: { id: 'invalid' } } as unknown as Request;
    const res = mockResponse();

    await getWorkParameterById(req, res);

    expect([400, 500]).toContain(res.status.mock.calls[0][0]);
    consoleSpy.mockRestore();
  });
});
