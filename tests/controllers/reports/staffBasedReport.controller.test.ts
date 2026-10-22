import { describe, it, expect, vi } from 'vitest';
import { StaffBasedReport } from '../../../src/controllers/reports/staffBasedReport.controller';
import type { Request, Response } from 'express';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.locals = {};
  return res as Response;
};

describe('Staff Based Report Controller', () => {
  it('exposes StaffBasedReport handler', () => {
    expect(typeof StaffBasedReport).toBe('function');
  });

  it('handles query error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = {
      query: {},
      companyDB: {
        query: vi.fn().mockRejectedValue(new Error('Procedure execution failed')),
      },
      currentDBName: 'Company_DB',
    } as unknown as Request;
    const res = mockResponse();

    await StaffBasedReport(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    consoleSpy.mockRestore();
  });
});
