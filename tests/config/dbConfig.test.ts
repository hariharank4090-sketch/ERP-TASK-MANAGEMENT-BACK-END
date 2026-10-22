import { describe, it, expect, vi } from 'vitest';
import { connectDB } from '../../src/config/dbConfig';
import sql from 'mssql';

describe('Legacy MSSQL dbConfig', () => {
  it('exposes connectDB function and attempts connection', () => {
    const connectSpy = vi.spyOn(sql, 'connect').mockImplementation((_cfg: any, cb?: any) => {
      if (cb) cb(null);
      return Promise.resolve({} as any);
    });

    expect(typeof connectDB).toBe('function');
    connectDB();
    expect(connectSpy).toHaveBeenCalled();

    connectSpy.mockRestore();
  });
});
