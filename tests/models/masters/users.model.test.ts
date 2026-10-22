import { describe, it, expect } from 'vitest';
import {
  UserMaster,
  initUserModel,
  userCreateSchema,
  userUpdateSchema,
  changePasswordSchema,
} from '../../../src/models/masters/users/users.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Masters Users Model & Schemas', () => {
  it('initializes UserMaster model correctly', () => {
    const sequelize = getDefaultConnection();
    const model = initUserModel(sequelize);

    expect(model).toBe(UserMaster);
    expect(model.tableName).toBe('tbl_Users');
    expect(model.rawAttributes.Global_User_ID).toBeDefined();
    expect(model.rawAttributes.UserName).toBeDefined();
    expect(model.rawAttributes.Password).toBeDefined();
  });

  it('validates userCreateSchema', () => {
    const valid = {
      UserName: 'admin_user',
      Password: 'securePassword123',
      Name: 'Admin',
      UserTypeId: 1,
    };

    const res = userCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates userUpdateSchema', () => {
    const update = {
      Name: 'Super Admin',
    };

    const res = userUpdateSchema.safeParse(update);
    expect(res.success).toBe(true);
  });

  it('validates changePasswordSchema', () => {
    const valid = {
      oldPassword: 'currentPassword123',
      newPassword: 'newStrongPassword456',
    };

    const res = changePasswordSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});
