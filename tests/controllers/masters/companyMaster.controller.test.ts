import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Company Master Controller', () => {
  it('checks company master controller source file exists', () => {
    const filePath = path.resolve(__dirname, '../../../src/controllers/masters/taskManagement/companyMaster.controller.ts');
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
