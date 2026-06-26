import { DataTypes, Model, QueryTypes, Sequelize } from 'sequelize';
import { z } from 'zod';

const modelName = 'User';

export interface UserAttributes {
    UserId: number;
    Global_User_ID: string | null;
    UserTypeId: number | null;
    Name: string;
    UserName: string;
    Password: string;
    Company_Id: number | null;
    BranchId: number | null;
    UDel_Flag: boolean;
    Autheticate_Id: string | null;
}

type UserCreationAttributes = Omit<UserAttributes, 'UserId'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare UserId: number;
    declare Global_User_ID: string | null;
    declare UserTypeId: number | null;
    declare Name: string;
    declare UserName: string;
    declare Password: string;
    declare Company_Id: number | null;
    declare BranchId: number | null;
    declare UDel_Flag: boolean;
    declare Autheticate_Id: string | null;

    // Method to get next available ID for specific database
    static async getNextId(sequelizeInstance: Sequelize): Promise<number> {
        try {
            const result = await sequelizeInstance.query(
                'SELECT ISNULL(MAX(UserId), 0) + 1 as nextId FROM tbl_Users',
                { 
                    type: QueryTypes.SELECT,
                    raw: true 
                }
            ) as any[];
            
            return result[0]?.nextId || 1;
        } catch (error) {
            console.error('Error getting next ID:', error);
            throw error;
        }
    }

    // Initialize model with specific sequelize instance
    static initialize(sequelizeInstance: Sequelize): typeof User {
        User.init(
            {
                UserId: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    field: 'UserId',
                    allowNull: false
                },
                Global_User_ID: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                    field: 'Global_User_ID'
                },
                UserTypeId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'UserTypeId'
                },
                Name: {
                    type: DataTypes.STRING(200),
                    allowNull: false,
                    field: 'Name',
                    validate: {
                        notEmpty: true
                    }
                },
                UserName: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    field: 'UserName',
                    validate: {
                        notEmpty: true
                    }
                },
                Password: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    field: 'Password',
                    validate: {
                        notEmpty: true
                    }
                },
                Company_Id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'Company_Id'
                },
                BranchId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'BranchId'
                },
                UDel_Flag: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    field: 'UDel_Flag',
                    defaultValue: false
                },
                Autheticate_Id: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                    field: 'Autheticate_Id'
                }
            },
            {
                sequelize: sequelizeInstance,
                tableName: 'tbl_Users',
                modelName: modelName,
                timestamps: false,
                freezeTableName: true
            }
        );
        return User;
    }
}

// Zod schemas for GET operations only
export const userQuerySchema = z.object({
    page: z.coerce.number()
        .int()
        .positive()
        .default(1),
    limit: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(20),
    search: z.string().optional(),
    sortBy: z.enum(['UserId', 'Name', 'UserName', 'UserTypeId', 'Company_Id', 'BranchId'])
        .default('UserId'),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC'),
    companyId: z.coerce.number().int().positive().optional(),
    branchId: z.coerce.number().int().positive().optional(),
    userTypeId: z.coerce.number().int().positive().optional(),
    activeOnly: z.coerce.boolean().default(true)
});

export const userIdSchema = z.object({
    id: z.coerce.number()
        .int()
        .positive('Valid User ID is required')
});

export type UserQueryParams = z.infer<typeof userQuerySchema>;