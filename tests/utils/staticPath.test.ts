import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Static Path Module', () => {
  it('checks staticPath module file exists', () => {
    const filePath = path.resolve(__dirname, '../../src/staticPath.ts');
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
