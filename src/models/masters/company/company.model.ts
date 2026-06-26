// src/models/masters/company/company.model.ts
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

const modelName = 'CompanyMaster';

export interface CompanyAttributes {
    Local_Comp_Id: number;
    Company_Name?: string | null;
    DB_Name?: string | null;
    Address?: string | null;
    Phone?: string | null;
    Email?: string | null;
    IsActive?: number | null;
}

type CompanyCreationAttributes = Optional<CompanyAttributes, 'Local_Comp_Id'>;

export class CompanyMaster extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
    declare Local_Comp_Id: number;
    declare Company_Name: string | null;
    declare DB_Name: string | null;
    declare Address: string | null;
    declare Phone: string | null;
    declare Email: string | null;
    declare IsActive: number | null;
}

export function initCompanyModel(sequelize: Sequelize): typeof CompanyMaster {
    CompanyMaster.init(
        {
            Local_Comp_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: 'Local_Comp_Id'
            },
            Company_Name: {
                type: DataTypes.STRING(150),
                allowNull: true,
                field: 'Company_Name'
            },
            DB_Name: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'DB_Name'
            },
            Address: {
                type: DataTypes.STRING(500),
                allowNull: true,
                field: 'Address'
            },
            Phone: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'Phone'
            },
            Email: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'Email'
            },
            IsActive: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 1,
                field: 'IsActive'
            }
        },
        {
            sequelize,
            tableName: 'tbl_Company',
            modelName: modelName,
            timestamps: false,
            freezeTableName: true,
            schema: 'dbo'
        }
    );
    return CompanyMaster;
}