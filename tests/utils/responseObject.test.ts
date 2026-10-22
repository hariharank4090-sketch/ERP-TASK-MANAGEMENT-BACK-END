import { describe, it, expect, vi } from 'vitest';
import {
  success,
  dataFound,
  noData,
  servError,
  failed,
  invalidInput,
  notFound,
  invalidCredentials,
  sentData,
  Unauthorized,
  created,
  updated,
  deleted,
} from '../../src/responseObject';
import type { Response, Request } from 'express';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.locals = { startedAt: BigInt(1000), requestId: 'req-123' };
  res.req = { body: {}, method: 'GET', originalUrl: '/test' } as Request;
  return res as Response;
};

describe('ResponseObject Utility', () => {
  it('returns success response with 200 and data', () => {
    const res = mockResponse();
    success(res, 'Success message', [{ id: 1 }], { page: 1 });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Success message',
      data: [{ id: 1 }],
      others: { page: 1 },
    });
  });

  it('returns dataFound response with 200', () => {
    const res = mockResponse();
    dataFound(res, [{ id: 2 }], 'Data found');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Data found',
      data: [{ id: 2 }],
      others: {},
    });
  });

  it('returns noData response with 200 and empty data array', () => {
    const res = mockResponse();
    noData(res, 'Items not found');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [],
        message: 'Items not found',
      })
    );
  });

  it('returns servError response with 500 status', () => {
    const res = mockResponse();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    servError(new Error('Internal explosion'), res, 'Internal error');

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Internal error',
      })
    );
    consoleSpy.mockRestore();
  });

  it('returns failed response with custom or 400 status', () => {
    const res = mockResponse();
    failed(res, 'Action failed');

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Action failed',
      })
    );
  });

  it('returns invalidInput with 400 status', () => {
    const res = mockResponse();
    invalidInput(res, 'Invalid parameter');

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid parameter',
      })
    );
  });

  it('returns notFound with 200 status and success false', () => {
    const res = mockResponse();
    notFound(res, 'User not found');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'User not found',
      })
    );
  });

  it('returns invalidCredentials with 401 status', () => {
    const res = mockResponse();
    invalidCredentials(res, 'Bad credentials');

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Bad credentials',
      })
    );
  });

  it('returns Unauthorized with 400 status', () => {
    const res = mockResponse();
    Unauthorized(res, 'Token expired');

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Token expired',
      })
    );
  });

  it('returns created with 201 status', () => {
    const res = mockResponse();
    created(res, { id: 10 }, 'Item created');

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ id: 10 }],
        message: 'Item created',
        success: true,
      })
    );
  });

  it('returns updated with 200 status', () => {
    const res = mockResponse();
    updated(res, { id: 10 }, 'Item updated');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ id: 10 }],
        message: 'Item updated',
        success: true,
      })
    );
  });

  it('returns deleted with 200 status', () => {
    const res = mockResponse();
    deleted(res, 'Item deleted');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Item deleted',
      })
    );
  });

  it('handles sentData correctly when data exists or empty', () => {
    const res1 = mockResponse();
    sentData(res1, [{ id: 1 }]);
    expect(res1.status).toHaveBeenCalledWith(200);

    const res2 = mockResponse();
    sentData(res2, []);
    expect(res2.status).toHaveBeenCalledWith(200);
  });
});
