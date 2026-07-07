"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTypeAccKey = exports.userTypeUpdateSchema = exports.userTypeCreateSchema = exports.UserTypeMaster = void 0;
exports.initUserTypeModel = initUserTypeModel;
// src/models/masters/userType/userType.model.ts
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const modelName = 'UserTypeMaster';
// ─── Model Class ──────────────────────────────────────────────────────────────
class UserTypeMaster extends sequelize_1.Model {
}
exports.UserTypeMaster = UserTypeMaster;
// ─── Per-connection cache ─────────────────────────────────────────────────────
// We keep one initialised class per Sequelize instance so that calling
// initUserTypeModel() multiple times with the same connection is safe.
const modelCache = new WeakMap();
/**
 * Factory function — ALWAYS pass the per-request company Sequelize instance
 * (req.companyDB), never the default connection.
 *
 * tbl_User_Type lives in the COMPANY database (e.g. ERP_DB_SMT_TEST),
 * NOT in User_Portal_Test.
 *
 * Usage in controller:
 *   const UserTypeModel = initUserTypeModel(req.companyDB!);
 */
function initUserTypeModel(sequelize) {
    // Return cached model if already initialised for this connection
    if (modelCache.has(sequelize)) {
        return modelCache.get(sequelize);
    }
    // Create a new subclass so each connection gets its own model class.
    // This avoids the Sequelize "model already defined" error when multiple
    // company connections are active at the same time.
    class UserTypeMasterInstance extends sequelize_1.Model {
    }
    UserTypeMasterInstance.init({
        Id: {
            type: sequelize_1.DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'Id',
        },
        UserType: {
            type: sequelize_1.DataTypes.STRING(250),
            allowNull: false,
            unique: true,
            field: 'UserType',
        },
        Alias: {
            type: sequelize_1.DataTypes.STRING(250),
            allowNull: true,
            field: 'Alias',
        },
        IsActive: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            field: 'IsActive',
        },
    }, {
        sequelize,
        tableName: 'tbl_User_Type',
        modelName,
        timestamps: false,
        freezeTableName: true,
        schema: 'dbo',
    });
    modelCache.set(sequelize, UserTypeMasterInstance);
    return UserTypeMasterInstance;
}
// ─── Zod Validation Schemas ───────────────────────────────────────────────────
exports.userTypeCreateSchema = zod_1.z.object({
    UserType: zod_1.z.string().min(1, 'UserType cannot be empty'),
    Alias: zod_1.z.string().optional().nullable(),
    IsActive: zod_1.z.number().optional().default(1),
});
exports.userTypeUpdateSchema = zod_1.z.object({
    UserType: zod_1.z.string().min(1, 'UserType cannot be empty').optional(),
    Alias: zod_1.z.string().optional().nullable(),
    IsActive: zod_1.z.number().optional(),
});
// ─── Field Key Constants ──────────────────────────────────────────────────────
exports.userTypeAccKey = {
    Id: `${modelName}.Id`,
    UserType: `${modelName}.UserType`,
    Alias: `${modelName}.Alias`,
    IsActive: `${modelName}.IsActive`,
};
