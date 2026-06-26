// src/models/masters/users/users.model.ts
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from "zod";

const modelName = 'UserMaster';

export interface UserAttributes {
    Global_User_ID: number;
    Local_User_ID?: number | null;
    Company_Id?: number | null;
    Name?: string | null;
    Password?: string | null;
    UserTypeId?: number | null;
    UserName?: string | null;
    UDel_Flag?: number | null;
    Autheticate_Id?: string | null;
    Created?: Date | null;
    Updated?: Date | null;
}

type UserCreationAttributes = Optional<UserAttributes, 'Global_User_ID' | 'Local_User_ID' | 'Company_Id' | 'Name' | 'Password' | 'UserTypeId' | 'UserName' | 'UDel_Flag' | 'Autheticate_Id' | 'Created' | 'Updated'>;

export class UserMaster extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare Global_User_ID: number;
    declare Local_User_ID: number | null;
    declare Company_Id: number | null;
    declare Name: string | null;
    declare Password: string | null;
    declare UserTypeId: number | null;
    declare UserName: string | null;
    declare UDel_Flag: number | null;
    declare Autheticate_Id: string | null;
    declare Created: Date | null;
    declare Updated: Date | null;
    UserId: any;
}

export function initUserModel(sequelize: Sequelize): typeof UserMaster {
    UserMaster.init(
        {
            Global_User_ID: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
                field: 'Global_User_ID'
            },
            Local_User_ID: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'Local_User_ID'
            },
            Company_Id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Company_Id'
            },
            Name: {
                type: DataTypes.STRING(150),
                allowNull: true,
                field: 'Name'
            },
            Password: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'Password'
            },
            UserTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'UserTypeId'
            },
            UserName: {
                type: DataTypes.STRING(150),
                allowNull: true,
                unique: true,
                field: 'UserName'
            },
            UDel_Flag: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'UDel_Flag'
            },
            Autheticate_Id: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'Autheticate_Id'
            },
            Created: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'Created',
                defaultValue: DataTypes.NOW
            },
            Updated: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'Updated',
                defaultValue: DataTypes.NOW
            },
        },
        {
            sequelize,
            tableName: 'tbl_Users',
            modelName: modelName,
            timestamps: false,
            freezeTableName: true,
            schema: 'dbo',
            defaultScope: {
                attributes: { exclude: ['Password'] }
            }
        }
    );
    return UserMaster;
}

export const userCreateSchema = z.object({
    UserTypeId: z.number().optional(),
    Name: z.string().min(4, "Name should be minimum 4 chars").optional(),
    UserName: z.string().min(6, "User name should be minimum 6 chars").optional(),
    Password: z.string().min(6, "Password should be minimum 6 chars").optional(),
    Global_User_ID: z.number().optional(),
    Local_User_ID: z.number().optional(),
    Company_Id: z.number().optional(),
    Autheticate_Id: z.string().optional(),
});

export const userUpdateSchema = z.object({
    UserTypeId: z.number().optional(),
    Name: z.string().min(4, "Name should be minimum 4 chars").optional(),
    UserName: z.string().min(6, "User name should be minimum 6 chars").optional(),
    UDel_Flag: z.number().optional(),
    Global_User_ID: z.number().optional(),
    Local_User_ID: z.number().optional(),
    Company_Id: z.number().optional(),
    Autheticate_Id: z.string().optional(),
    Password: z.never().optional(),
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(6),
});