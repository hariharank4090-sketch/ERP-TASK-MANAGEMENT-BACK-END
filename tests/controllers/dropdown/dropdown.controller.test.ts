import { describe, it, expect, vi } from 'vitest';
import {
  getProjectHeadDropdown,
  getProjectStatusDropdown,
  getProjectStageDropdown,
  getAllDropdowns,
} from '../../../src/controllers/dropdown/dropdown.controller';
import type { Request, Response } from 'express';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe('Dropdown Controller', () => {
  it('returns project status dropdown options with 200', async () => {
    const req = { query: {} } as Request;
    const res = mockResponse();

    await getProjectStatusDropdown(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Project status options retrieved successfully',
      })
    );
  });

  it('handles error in getProjectHeadDropdown when DB context is missing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = { query: {} } as Request;
    const res = mockResponse();

    await getProjectHeadDropdown(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
    consoleSpy.mockRestore();
  });

  it('returns project stages dropdown options with 200 when companyDB is attached', async () => {
    const req = {
      currentCompanyId: 1,
      query: { projectId: '10', activeOnly: 'true' },
      headers: {},
      companyDB: {
        config: { database: 'ERP_DB_TEST_25_09_2026' },
        query: vi.fn().mockResolvedValue([
          {
            Id: 1,
            Project_Id: 10,
            Company_Id: 1,
            Stage_Name: 'Planning',
            Sort_Order: 1,
            IsActive: 1,
            CreatedAt: '2026-09-25T10:00:00.000Z',
          },
        ]),
      },
    } as unknown as Request;
    const res = mockResponse();

    await getProjectStageDropdown(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Project stages retrieved successfully',
        count: 1,
        data: [
          expect.objectContaining({
            value: 1,
            label: 'Planning',
            Id: 1,
            Project_Id: 10,
            Company_Id: 1,
            Stage_Name: 'Planning',
            Sort_Order: 1,
            IsActive: 1,
          }),
        ],
      })
    );
  });
});
