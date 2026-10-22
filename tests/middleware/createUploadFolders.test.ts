import { describe, it, expect, vi } from 'vitest';
import { createUploadFolders, imageFolder } from '../../src/middleware/createUploadFolders';
import fs from 'fs';

describe('createUploadFolders Middleware', () => {
  it('exposes imageFolder directory paths', () => {
    expect(imageFolder.product).toBeDefined();
    expect(imageFolder.attendance).toBeDefined();
    expect(imageFolder.forumDocument).toBeDefined();
    expect(imageFolder.retailer).toBeDefined();
    expect(imageFolder.visitLog).toBeDefined();
  });

  it('creates directories if they do not exist', () => {
    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const mkdirSpy = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined as any);

    createUploadFolders();

    expect(mkdirSpy).toHaveBeenCalled();
    existsSpy.mockRestore();
    mkdirSpy.mockRestore();
  });
});
