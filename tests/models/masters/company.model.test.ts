import { describe, it, expect } from 'vitest';
import { CompanyMaster, initCompanyModel } from '../../../src/models/masters/company/company.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Company Model (masters/company)', () => {
  it('initializes CompanyMaster model correctly', () => {
    const sequelize = getDefaultConnection();
    const model = initCompanyModel(sequelize);

    expect(model).toBe(CompanyMaster);
    expect(model.tableName).toBe('tbl_Company');
    expect(model.rawAttributes.Local_Comp_Id).toBeDefined();
    expect(model.rawAttributes.Company_Name).toBeDefined();
    expect(model.rawAttributes.DB_Name).toBeDefined();
    expect(model.rawAttributes.IsActive).toBeDefined();
  });
});
