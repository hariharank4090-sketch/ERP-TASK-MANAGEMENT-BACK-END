import { describe, it, expect, vi } from 'vitest';
import {
  getProjectHeadDropdown,
  getProjectStatusDropdown,
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
});
