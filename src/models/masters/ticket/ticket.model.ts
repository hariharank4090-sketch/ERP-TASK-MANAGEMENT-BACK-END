import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';

export interface TicketAttributes {
    Id: number;
    Description?: string | null;
    Ret_Id?: number | null;
    Category?: string | null;
    Subject?: string | null;
    Priority?: string | null;
    Image_Url?: string | null;
    Created_By?: number | null;
    Created_At?: Date | null;
    Updated_By?: number | null;
    Updated_At?: Date | null;
    Status?: string | null;
    From_CompanyId?: number | null;
    To_CompanyId?: number | null;
}

type TicketCreationAttributes = Optional<TicketAttributes, 'Id'>;

export class TicketGenInfo extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
    declare Id: number;
    declare Description: string | null;
    declare Ret_Id: number | null;
    declare Category: string | null;
    declare Subject: string | null;
    declare Priority: string | null;
    declare Image_Url: string | null;
    declare Created_By: number | null;
    declare Created_At: Date | null;
    declare Updated_By: number | null;
    declare Updated_At: Date | null;
    declare Status: string | null;
    declare From_CompanyId: number | null;
    declare To_CompanyId: number | null;
}

export function initTicketGenInfoModel(sequelize: Sequelize): typeof TicketGenInfo {
    TicketGenInfo.init(
        {
            Id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                field: 'Id'
            },
            Description: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'Description'
            },
            Ret_Id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'Ret_Id'
            },
            Category: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'Category'
            },
            Subject: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'Subject'
            },
            Priority: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'Priority'
            },
            Image_Url: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'Image_Url'
            },
            Created_By: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'Created_By'
            },
            Created_At: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'Created_At'
            },
            Updated_By: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'Updated_By'
            },
            Updated_At: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'Updated_At'
            },
            Status: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'Status'
            },
            From_CompanyId: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'From_CompanyId'
            },
            To_CompanyId: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'To_CompanyId'
            }
        },
        {
            sequelize,
            tableName: 'tbl_Ticket_Gen_Info',
            modelName: 'TicketGenInfo',
            timestamps: false,
            freezeTableName: true
        }
    );
    return TicketGenInfo;
}

export interface CategoryAttributes {
    Id: number;
    Category?: string | null;
    Company_Id?: number | null;
}

type CategoryCreationAttributes = Optional<CategoryAttributes, 'Id'>;

export class TicketCategory extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    declare Id: number;
    declare Category: string | null;
    declare Company_Id: number | null;
}

export function initTicketCategoryModel(sequelize: Sequelize): typeof TicketCategory {
    TicketCategory.init(
        {
            Id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                field: 'Id'
            },
            Category: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'Category'
            },
            Company_Id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'Company_Id'
            }
        },
        {
            sequelize,
            tableName: 'tbl_Category',
            modelName: 'TicketCategory',
            timestamps: false,
            freezeTableName: true
        }
    );
    return TicketCategory;
}

export const ticketQuerySchema = z.object({
    User_Id: z.coerce.string().regex(/^\d+$/, 'User_Id must be a valid numeric id').optional(),
    companyId: z.coerce.string().regex(/^\d+$/, 'companyId must be a valid numeric id').optional(),
    Company_Id: z.coerce.string().regex(/^\d+$/, 'Company_Id must be a valid numeric id').optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(200).default(50)
});

export type TicketQueryInput = z.infer<typeof ticketQuerySchema>;
