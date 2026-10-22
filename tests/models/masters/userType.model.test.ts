import { describe, it, expect } from 'vitest';
import {
  UserTypeMaster,
  initUserTypeModel,
  userTypeCreateSchema,
  userTypeUpdateSchema,
  userTypeAccKey,
} from '../../../src/models/masters/users/userType.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Masters User Type Model & Schemas', () => {
  it('initializes UserTypeMaster model', () => {
    const sequelize = getDefaultConnection();
    const model = initUserTypeModel(sequelize);

    expect(model).toBeDefined();
    expect(model.tableName).toBe('tbl_User_Type');
    expect(model.rawAttributes.Id).toBeDefined();
    expect(model.rawAttributes.UserType).toBeDefined();
  });

  it('validates userTypeCreateSchema', () => {
    const valid = {
      UserType: 'Project Manager',
      IsActive: 1,
    };

    const res = userTypeCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates userTypeUpdateSchema and access keys', () => {
    const update = { UserType: 'Senior Manager' };
    expect(userTypeUpdateSchema.safeParse(update).success).toBe(true);
    expect(typeof userTypeAccKey).toBe('object');
    expect(userTypeAccKey).toHaveProperty('UserType');
  });
});
