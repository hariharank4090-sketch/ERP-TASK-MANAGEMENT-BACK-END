import { describe, it, expect } from 'vitest';
import {
  Company_Master,
  initCompanyModel,
  companyCreateSchema,
  companyUpdateSchema,
  companyQuerySchema,
  companyIdSchema,
  companyAccKey,
} from '../../../src/models/masters/companyMaster/type.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Company Master Model & Schemas', () => {
  it('initializes Company_Master model properly', () => {
    const sequelize = getDefaultConnection();
    const model = initCompanyModel(sequelize);

    expect(model).toBe(Company_Master);
    expect(model.tableName).toBe('tbl_Company_Master');
    expect(model.rawAttributes.Company_id).toBeDefined();
    expect(model.rawAttributes.Company_Code).toBeDefined();
    expect(model.rawAttributes.Company_Name).toBeDefined();
  });

  it('validates companyCreateSchema with valid company data', () => {
    const valid = {
      Company_Code: 'CMP01',
      Company_Name: 'Acme Global Corp',
      Mail: 'info@acme.com',
      Country: 'India',
    };

    const res = companyCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates companyUpdateSchema partial data', () => {
    const res = companyUpdateSchema.safeParse({ Company_Name: 'Acme Updated' });
    expect(res.success).toBe(true);
  });

  it('validates companyQuerySchema defaults', () => {
    const q = companyQuerySchema.parse({});
    expect(q.page).toBe(1);
    expect(q.limit).toBe(20);
    expect(q.sortBy).toBe('Company_id');
  });

  it('validates companyIdSchema', () => {
    expect(companyIdSchema.safeParse({ id: 1 }).success).toBe(true);
    expect(companyIdSchema.safeParse({ id: -1 }).success).toBe(false);
  });

  it('exports companyAccKey list', () => {
    expect(typeof companyAccKey).toBe('object');
    expect(companyAccKey.Company_Code).toBeDefined();
  });
});
