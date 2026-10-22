import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Pagination Middleware Module', () => {
  it('checks pagination middleware file exists', () => {
    const filePath = path.resolve(__dirname, '../../src/middleware/pagination.ts');
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
