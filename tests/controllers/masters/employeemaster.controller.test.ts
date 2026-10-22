import { describe, it, expect, vi } from 'vitest';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../../src/controllers/masters/taskManagement/employeemaster.controller';
import { getDefaultConnection } from '../../../src/config/database.config';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Employee Master Controller', () => {
  it('exposes employee master CRUD handlers', () => {
    expect(typeof getAllEmployees).toBe('function');
    expect(typeof getEmployeeById).toBe('function');
    expect(typeof createEmployee).toBe('function');
    expect(typeof updateEmployee).toBe('function');
    expect(typeof deleteEmployee).toBe('function');
  });

  it('handles invalid input in createEmployee', async () => {
    const req = {
      body: {},
      companyDB: getDefaultConnection(),
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await createEmployee(req, res);

    expect([400, 403, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
