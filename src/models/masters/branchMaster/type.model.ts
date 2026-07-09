import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';

const modelName = 'Branch_Master';

export interface BranchAttributes {
    BranchId: number;
    Company_id?: number | null;
    BranchCode?: string | null;
    BranchName?: string | null;
    Tele_Code?: string | null;
    BranchTel1?: string | null;
    Tele1_Code?: string | null;
    BranchTel?: string | null;
    BranchAddress?: string | null;
    E_Mail?: string | null;
    BranchCity?: string | null;
    BranchCountry?: string | null;
    BranchIncharge?: string | null;
    BranchIncMobile?: string | null;
    Pin_Code?: string | null;
    State?: string | null;
    Entry_By?: number | null;
    Entry_Date?: Date | null;
    Modified_By?: number | null;
    Modified_Date?: Date | null;
    Del_Flag?: number | null;
    Deleted_By?: number | null;
    Deleted_Date?: Date | null;
}

type BranchCreationAttributes = Optional<BranchAttributes, 'BranchId'>;

export class Branch_Master extends Model<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
    declare BranchId: number;
    declare Company_id: number | null;
    declare BranchCode: string | null;
    declare BranchName: string | null;
    declare Tele_Code: string | null;
    declare BranchTel1: string | null;
    declare Tele1_Code: string | null;
    declare BranchTel: string | null;
    declare BranchAddress: string | null;
    declare E_Mail: string | null;
    declare BranchCity: string | null;
    declare BranchCountry: string | null;
    declare BranchIncharge: string | null;
    declare BranchIncMobile: string | null;
    declare Pin_Code: string | null;
    declare State: string | null;
    declare Entry_By: number | null;
    declare Entry_Date: Date | null;
    declare Modified_By: number | null;
    declare Modified_Date: Date | null;
    declare Del_Flag: number | null;
    declare Deleted_By: number | null;
    declare Deleted_Date: Date | null;
}

export function initBranchModel(sequelize: Sequelize): typeof Branch_Master {
    Branch_Master.init(
        {
            BranchId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: 'BranchId'
            },
            Company_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Company_id'
            },
            BranchCode: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'BranchCode'
            },
            BranchName: {
                type: DataTypes.STRING(250),
                allowNull: true,
                field: 'BranchName'
            },
            Tele_Code: {
                type: DataTypes.STRING(20),
                allowNull: true,
                field: 'Tele_Code'
            },
            BranchTel1: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'BranchTel1'
            },
            Tele1_Code: {
                type: DataTypes.STRING(20),
                allowNull: true,
                field: 'Tele1_Code'
            },
            BranchTel: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'BranchTel'
            },
            BranchAddress: {
                type: DataTypes.STRING(500),
                allowNull: true,
                field: 'BranchAddress'
            },
            E_Mail: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'E_Mail'
            },
            BranchCity: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'BranchCity'
            },
            BranchCountry: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'BranchCountry'
            },
            BranchIncharge: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'BranchIncharge'
            },
            BranchIncMobile: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'BranchIncMobile'
            },
            Pin_Code: {
                type: DataTypes.STRING(20),
                allowNull: true,
                field: 'Pin_Code'
            },
            State: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'State'
            },
            Entry_By: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Entry_By'
            },
            Entry_Date: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'Entry_Date'
            },
            Modified_By: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Modified_By'
            },
            Modified_Date: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'Modified_Date'
            },
            Del_Flag: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                field: 'Del_Flag'
            },
            Deleted_By: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Deleted_By'
            },
            Deleted_Date: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'Deleted_Date'
            }
        },
        {
            sequelize,
            tableName: 'tbl_Branch_Master',
            modelName: modelName,
            timestamps: false,
            freezeTableName: true,
            defaultScope: {
                where: {
                    Del_Flag: 0
                }
            }
        }
    );
    
    return Branch_Master;
}

export const branchCreateSchema = z.object({
    Company_id: z.coerce.number().optional(),
    BranchCode: z.string().max(50).trim().optional(),
    BranchName: z.string().max(250).trim().optional(),
    Tele_Code: z.string().max(20).optional(),
    BranchTel1: z.string().max(50).optional(),
    Tele1_Code: z.string().max(20).optional(),
    BranchTel: z.string().max(50).optional(),
    BranchAddress: z.string().max(500).optional(),
    E_Mail: z.string().email('Invalid email').max(100).optional().or(z.literal('')),
    BranchCity: z.string().max(100).optional(),
    BranchCountry: z.string().max(100).optional(),
    BranchIncharge: z.string().max(100).optional(),
    BranchIncMobile: z.string().max(50).optional(),
    Pin_Code: z.string().max(20).optional(),
    State: z.string().max(100).optional(),
    Del_Flag: z.coerce.number().optional()
});

export const branchUpdateSchema = branchCreateSchema.partial();

export const branchQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    sortBy: z.string().default('BranchId'),
    sortOrder: z.enum(['ASC', 'DESC']).default('ASC')
});

export const branchIdSchema = z.object({
    id: z.coerce.number().int().positive('Valid ID is required')
});

export type BranchCreateInput = z.infer<typeof branchCreateSchema>;
export type BranchUpdateInput = z.infer<typeof branchUpdateSchema>;
export type BranchQueryParams = z.infer<typeof branchQuerySchema>;
