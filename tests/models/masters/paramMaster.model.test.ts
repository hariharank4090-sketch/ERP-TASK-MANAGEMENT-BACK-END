import { describe, it, expect } from 'vitest';
import {
  ParamMaster,
  initParamMasterModel,
  ParamMasterModel,
  ParamMasterCreationSchema,
  ParamMasterUpdateSchema,
  ParamMasterQuerySchema,
  paramMasterIdSchema,
  getDelFlagText,
  formatParamMasterForResponse,
} from '../../../src/models/masters/parametMaster/type.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Param Master Model & Schemas', () => {
  it('initializes ParamMaster model properly', () => {
    const sequelize = getDefaultConnection();
    const model = initParamMasterModel(sequelize);

    expect(model).toBe(ParamMaster);
    expect(model.tableName).toBe('tbl_Paramet_Master');
    expect(model.rawAttributes.Paramet_Id).toBeDefined();
    expect(ParamMasterModel).toBeDefined();
  });

  it('validates ParamMasterCreationSchema', () => {
    const valid = {
      Paramet_Name: 'Resolution Time',
      Paramet_Data_Type: 1,
      Company_id: 1,
    };

    const res = ParamMasterCreationSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates update and query schemas', () => {
    expect(ParamMasterUpdateSchema.safeParse({ Paramet_Name: 'Response Time' }).success).toBe(true);
    expect(ParamMasterQuerySchema.safeParse({}).success).toBe(true);
    expect(paramMasterIdSchema.safeParse({ id: 3 }).success).toBe(true);
  });

  it('checks formatting helpers', () => {
    expect(getDelFlagText(0)).toBe('Active');
    expect(getDelFlagText(1)).toBe('Deleted');

    const formatted = formatParamMasterForResponse({
      Paramet_Id: 1,
      Paramet_Name: 'Test Param',
      Del_Flag: 0,
    });
    expect(formatted.delFlagText).toBe('Active');
  });
});
