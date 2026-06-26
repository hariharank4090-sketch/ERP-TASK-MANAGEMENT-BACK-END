// src/models/masters/userType/userType.model.ts
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';

const modelName = 'UserTypeMaster';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface UserTypeAttributes {
    Id: number;
    UserType: string | null;
    Alias: string | null;
    IsActive: number;
}

export type UserTypeCreationAttributes = Optional<
    UserTypeAttributes,
    'Id' | 'Alias' | 'IsActive'
>;

// ─── Model Class ──────────────────────────────────────────────────────────────

export class UserTypeMaster
    extends Model<UserTypeAttributes, UserTypeCreationAttributes>
    implements UserTypeAttributes
{
    declare Id: number;
    declare UserType: string | null;
    declare Alias: string | null;
    declare IsActive: number;
}

// ─── Per-connection cache ─────────────────────────────────────────────────────
// We keep one initialised class per Sequelize instance so that calling
// initUserTypeModel() multiple times with the same connection is safe.

const modelCache = new WeakMap<Sequelize, typeof UserTypeMaster>();

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
export function initUserTypeModel(sequelize: Sequelize): typeof UserTypeMaster {
    // Return cached model if already initialised for this connection
    if (modelCache.has(sequelize)) {
        return modelCache.get(sequelize)!;
    }

    // Create a new subclass so each connection gets its own model class.
    // This avoids the Sequelize "model already defined" error when multiple
    // company connections are active at the same time.
    class UserTypeMasterInstance extends Model<
        UserTypeAttributes,
        UserTypeCreationAttributes
    > implements UserTypeAttributes {
        declare Id: number;
        declare UserType: string | null;
        declare Alias: string | null;
        declare IsActive: number;
    }

    UserTypeMasterInstance.init(
        {
            Id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                field: 'Id',
            },
            UserType: {
                type: DataTypes.STRING(250),
                allowNull: false,
                unique: true,
                field: 'UserType',
            },
            Alias: {
                type: DataTypes.STRING(250),
                allowNull: true,
                field: 'Alias',
            },
            IsActive: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
                field: 'IsActive',
            },
        },
        {
            sequelize,
            tableName: 'tbl_User_Type',
            modelName,
            timestamps: false,
            freezeTableName: true,
            schema: 'dbo',
        },
    );

    modelCache.set(sequelize, UserTypeMasterInstance as unknown as typeof UserTypeMaster);
    return UserTypeMasterInstance as unknown as typeof UserTypeMaster;
}

// ─── Zod Validation Schemas ───────────────────────────────────────────────────

export const userTypeCreateSchema = z.object({
    UserType: z.string().min(1, 'UserType cannot be empty'),
    Alias:    z.string().optional().nullable(),
    IsActive: z.number().optional().default(1),
});

export const userTypeUpdateSchema = z.object({
    UserType: z.string().min(1, 'UserType cannot be empty').optional(),
    Alias:    z.string().optional().nullable(),
    IsActive: z.number().optional(),
});

// ─── Field Key Constants ──────────────────────────────────────────────────────

export const userTypeAccKey = {
    Id:       `${modelName}.Id`,
    UserType: `${modelName}.UserType`,
    Alias:    `${modelName}.Alias`,
    IsActive: `${modelName}.IsActive`,
};