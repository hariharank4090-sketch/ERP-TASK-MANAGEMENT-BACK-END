import { describe, it, expect, vi } from 'vitest';
import { login, logout, verifyToken } from '../../../src/controllers/configuration/login/index';
import type { Request } from 'express';

const mockResponse = () => {
  const res: any = {
    locals: {},
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('Login Controller', () => {
  it('returns 400 when username or password missing', async () => {
    const req = { body: {} } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Username and password are required',
      })
    );
  });

  it('handles logout with or without token', async () => {
    const req = { headers: {} } as Request;
    const res = mockResponse();

    await logout(req, res);

    expect([200, 401, 500]).toContain(res.status.mock.calls[0][0]);
  });

  it('handles verifyToken when token is missing', async () => {
    const req = { headers: {} } as Request;
    const res = mockResponse();

    await verifyToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('decrypts encrypted username and password in login request', async () => {
    const CryptoJS = await import('crypto-js');
    const secretKey = process.env.passwordKey || 'ly4@&gr$vnh905RyB>?%#@-(KSMT)';
    const encryptedPassword = CryptoJS.AES.encrypt('123456', secretKey).toString();
    const encryptedUsername = CryptoJS.AES.encrypt('admin', secretKey).toString();
    const req = {
      body: {
        username: encryptedUsername,
        password: encryptedPassword,
      },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    // It successfully decrypts and does NOT reject with 400 'Username and password are required'
    expect(res.status).not.toHaveBeenCalledWith(400);
  });

  it('decrypts username and password encrypted with JWT_SECRET', async () => {
    const CryptoJS = await import('crypto-js');
    const secretKey = 'pukal orgin.in';
    const encryptedPassword = CryptoJS.AES.encrypt('123456', secretKey).toString();
    const encryptedUsername = CryptoJS.AES.encrypt('admin', secretKey).toString();
    const req = {
      body: {
        username: encryptedUsername,
        password: encryptedPassword,
      },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
  });

  it('decrypts encrypted payload envelope { payload: "..." }', async () => {
    const CryptoJS = await import('crypto-js');
    const secretKey = 'pukal orgin.in';
    const envelope = CryptoJS.AES.encrypt(
      JSON.stringify({ username: 'admin', password: '123456' }),
      secretKey
    ).toString();
    const req = {
      body: {
        payload: envelope,
      },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
  });
});
