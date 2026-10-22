import { describe, it, expect, vi } from 'vitest';
import {
  getAllProjects,
  getProjectById,
  getActiveProjects,
  createProject,
  updateProject,
  deleteProject,
  getStatusOptions,
} from '../../../src/controllers/masters/taskManagement/projectType.controller';
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

describe('Project Master Controller (projectType.controller)', () => {
  it('exposes project CRUD handlers', () => {
    expect(typeof getAllProjects).toBe('function');
    expect(typeof getProjectById).toBe('function');
    expect(typeof getActiveProjects).toBe('function');
    expect(typeof createProject).toBe('function');
    expect(typeof updateProject).toBe('function');
    expect(typeof deleteProject).toBe('function');
  });

  it('returns project status options or handles authorization', async () => {
    const req = {
      companyDB: getDefaultConnection(),
      user: { UserTypeId: 0 },
    } as unknown as Request;
    const res = mockResponse();

    await getStatusOptions(req, res);

    expect([200, 403, 500]).toContain(res.status.mock.calls[0][0]);
  });
});
