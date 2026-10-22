import { describe, it, expect, vi } from 'vitest';
import fileRemoverMiddleware from '../../src/middleware/unSyncFile';
import fs from 'fs/promises';

describe('unSyncFile Middleware (fileRemoverMiddleware)', () => {
  it('unlinks file when file exists', async () => {
    const accessSpy = vi.spyOn(fs, 'access').mockResolvedValue(undefined);
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockResolvedValue(undefined);

    await expect(fileRemoverMiddleware('/path/to/existing.jpg')).resolves.toBeUndefined();

    expect(accessSpy).toHaveBeenCalledWith('/path/to/existing.jpg');
    expect(unlinkSpy).toHaveBeenCalledWith('/path/to/existing.jpg');

    accessSpy.mockRestore();
    unlinkSpy.mockRestore();
  });

  it('silently ignores ENOENT when file does not exist', async () => {
    const err: any = new Error('File not found');
    err.code = 'ENOENT';
    const accessSpy = vi.spyOn(fs, 'access').mockRejectedValue(err);

    await expect(fileRemoverMiddleware('/path/to/missing.jpg')).resolves.toBeUndefined();

    accessSpy.mockRestore();
  });

  it('re-throws other unexpected filesystem errors', async () => {
    const err: any = new Error('Permission denied');
    err.code = 'EACCES';
    const accessSpy = vi.spyOn(fs, 'access').mockRejectedValue(err);

    await expect(fileRemoverMiddleware('/protected/file.jpg')).rejects.toThrow('Permission denied');

    accessSpy.mockRestore();
  });
});
