import { describe, it, expect, vi } from 'vitest';
import getImage from '../../src/middleware/getImageIfExist';
import fs from 'fs';

describe('getImageIfExist Middleware', () => {
  it('returns default image when folder or image parameter is missing', () => {
    expect(getImage('', '')).toContain('imageURL/imageNotFound');
    expect(getImage('products', '')).toContain('imageURL/imageNotFound');
  });

  it('returns image url when file exists on disk', () => {
    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    const result = getImage('products', 'test.jpg');
    expect(result).toContain('products/test.jpg');

    existsSpy.mockRestore();
  });

  it('returns not found url when file does not exist on disk', () => {
    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    const result = getImage('products', 'missing.jpg');
    expect(result).toContain('imageURL/imageNotFound');

    existsSpy.mockRestore();
  });
});
