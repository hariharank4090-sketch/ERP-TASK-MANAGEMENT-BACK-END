import { describe, it, expect } from 'vitest';
import {
  ParametDataType,
  initParametDataTypeModel,
  ParametDataTypeModel,
  ParametDataTypeCreationSchema,
  ParametDataTypeUpdateSchema,
  ParametDataTypeQuerySchema,
  parametDataTypeIdSchema,
  formatParametDataTypeForResponse,
} from '../../../src/models/masters/taskParamType/type.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Task Param Type Model & Schemas', () => {
  it('initializes ParametDataType model properly', () => {
    const sequelize = getDefaultConnection();
    const model = initParametDataTypeModel(sequelize);

    expect(model).toBe(ParametDataType);
    expect(model.tableName).toBe('tbl_Paramet_Data_Type');
    expect(ParametDataTypeModel).toBeDefined();
  });

  it('validates ParametDataTypeCreationSchema', () => {
    const valid = {
      Para_Data_Type: 'Text',
      Para_Display_Name: 'Text String',
    };

    const res = ParametDataTypeCreationSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates update, query, and ID schemas', () => {
    expect(ParametDataTypeUpdateSchema.safeParse({ Para_Data_Type: 'Integer' }).success).toBe(true);
    expect(ParametDataTypeQuerySchema.safeParse({}).success).toBe(true);
    expect(parametDataTypeIdSchema.safeParse({ id: 1 }).success).toBe(true);
  });

  it('formats data type for response', () => {
    const formatted = formatParametDataTypeForResponse({
      Para_Data_Type_Id: 1,
      Para_Data_Type: 'Boolean',
      Para_Display_Name: 'True/False',
    });
    expect(formatted.Para_Data_Type_Id).toBe(1);
    expect(formatted.Para_Data_Type).toBe('Boolean');
  });
});
