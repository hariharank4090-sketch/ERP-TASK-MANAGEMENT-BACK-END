import { describe, it, expect } from 'vitest';
import { initUserModel } from '../../src/models/users.model';
import { getDefaultConnection } from '../../src/config/database.config';

describe('Root Users Model', () => {
  it('initializes the tbl_Users model successfully with proper schema', () => {
    const sequelize = getDefaultConnection();
    const UserModel = initUserModel(sequelize);

    expect(UserModel).toBeDefined();
    expect(UserModel.tableName).toBe('tbl_Users');
    expect(UserModel.rawAttributes.Global_User_ID).toBeDefined();
    expect(UserModel.rawAttributes.UserName).toBeDefined();
    expect(UserModel.rawAttributes.Name).toBeDefined();
  });
});
