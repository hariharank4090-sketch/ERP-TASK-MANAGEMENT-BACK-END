import { describe, it, expect, vi } from 'vitest';
import {
  getEmployeesByProject,
  getAllEmployees,
} from '../../../src/controllers/masters/employees.controller';
import { sequelize } from '../../../src/config/database.config';
import type { Request, Response } from 'express';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe('Masters Employees Controller', () => {
  it('exposes getEmployeesByProject and getAllEmployees functions', () => {
    expect(typeof getEmployeesByProject).toBe('function');
    expect(typeof getAllEmployees).toBe('function');
  });

  it('handles getAllEmployees error when companyDB is missing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const querySpy = vi.spyOn(sequelize, 'query').mockRejectedValue(new Error('Simulated DB error'));
    const req = { query: {} } as Request;
    const res = mockResponse();

    await getAllEmployees(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    querySpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
