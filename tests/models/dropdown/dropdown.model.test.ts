import { describe, it, expect, vi } from 'vitest';
import dropdownModel, {
  getProjectStatus,
  getProjectHeads,
  getEmployees,
  getTasks,
  getProjects,
  getProjectStages,
  getCompany,
  getAllDropdowns,
} from '../../../src/models/dropdown/dropdown.model';
import type { Request } from 'express';

describe('Dropdown Model Functions', () => {
  it('returns default bundle with all dropdown functions', () => {
    expect(dropdownModel.getProjectStatus).toBe(getProjectStatus);
    expect(dropdownModel.getEmployees).toBe(getEmployees);
    expect(dropdownModel.getProjectStages).toBe(getProjectStages);
    expect(dropdownModel.getAllDropdowns).toBe(getAllDropdowns);
  });

  it('returns static project status options', async () => {
    const statuses = await getProjectStatus();
    expect(statuses).toEqual([
      { value: 1, label: 'Active' },
      { value: 0, label: 'Inactive' },
    ]);
  });

  it('throws error when request is not provided for getProjectHeads', async () => {
    await expect(getProjectHeads(true, undefined)).rejects.toThrow('Request object is required');
  });

  it('throws error when companyDB is missing on request for getEmployees', async () => {
    const mockReq = {} as Request;
    await expect(getEmployees(true, mockReq)).rejects.toThrow('req.companyDB is not set');
  });

  it('queries dropdown items when companyDB is provided', async () => {
    const mockQuery = vi.fn().mockImplementation((queryStr: string) => {
      if (queryStr.includes('Global_User_ID')) return Promise.resolve([{ Global_User_ID: 1 }]);
      return Promise.resolve([{ value: 10, label: 'Dev Task' }]);
    });

    const mockReq = {
      companyDB: {
        config: { database: 'Mock_DB' },
        query: mockQuery,
      },
    } as unknown as Request;

    const tasks = await getTasks(true, mockReq);
    expect(Array.isArray(tasks)).toBe(true);
  });

  it('resolves company dropdown from currentCompanyId and currentCompanyName in request', async () => {
    const mockReq = {
      currentCompanyId: 101,
      currentCompanyName: 'Acme Industries',
      headers: {},
    } as unknown as Request;

    const companies = await getCompany(true, mockReq);
    expect(companies).toEqual([{ value: 101, label: 'Acme Industries' }]);
  });

  it('queries project stages from tbl_Project_Stage filtered by logged-in company', async () => {
    const mockQuery = vi.fn().mockResolvedValue([
      {
        Id: 1,
        Project_Id: 10,
        Company_Id: 1,
        Stage_Name: 'Requirement Gathering',
        Sort_Order: 1,
        IsActive: 1,
        CreatedAt: '2026-09-25T10:00:00.000Z',
        value: 1,
        label: 'Requirement Gathering',
      },
      {
        Id: 2,
        Project_Id: 10,
        Company_Id: 1,
        Stage_Name: 'Development',
        Sort_Order: 2,
        IsActive: 1,
        CreatedAt: '2026-09-25T10:05:00.000Z',
        value: 2,
        label: 'Development',
      },
    ]);

    const mockReq = {
      currentCompanyId: 1,
      query: { projectId: '10' },
      headers: {},
      companyDB: {
        config: { database: 'ERP_DB_TEST_25_09_2026' },
        query: mockQuery,
      },
    } as unknown as Request;

    const stages = await getProjectStages(true, mockReq);
    expect(stages).toHaveLength(2);
    expect(stages[0]).toEqual({
      value: 1,
      label: 'Requirement Gathering',
      Id: 1,
      Project_Id: 10,
      Company_Id: 1,
      Stage_Name: 'Requirement Gathering',
      Sort_Order: 1,
      IsActive: 1,
      CreatedAt: '2026-09-25T10:00:00.000Z',
    });
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('tbl_Project_Stage'),
      expect.objectContaining({
        replacements: { companyId: 1, projectId: 10 },
      })
    );
  });
});
