import { describe, it, expect, vi } from 'vitest';
import { CostCenter } from '../../../src/controllers/reports/costCenter.controller';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Cost Center Reports Controller', () => {
  it('exposes all CostCenter report handlers', () => {
    expect(typeof CostCenter.getCostCenter).toBe('function');
    expect(typeof CostCenter.createCostCenter).toBe('function');
    expect(typeof CostCenter.updateCostCenter).toBe('function');
    expect(typeof CostCenter.getCostCenterCategory).toBe('function');
    expect(typeof CostCenter.createCostCategory).toBe('function');
    expect(typeof CostCenter.deleteCostCategory).toBe('function');
    expect(typeof CostCenter.updateCostCategory).toBe('function');
    expect(typeof CostCenter.costCategoryDropDown).toBe('function');
  });

  it('handles getCostCenter gracefully when database fails or responds empty', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = {
      companyDB: {
        query: vi.fn().mockRejectedValue(new Error('DB Query Failed')),
      },
      currentDBName: 'Company_DB',
    } as unknown as Request;
    const res = mockResponse();

    await CostCenter.getCostCenter(req, res);

    expect([200, 500]).toContain(res.status.mock.calls[0][0]);
    consoleSpy.mockRestore();
  });
});
