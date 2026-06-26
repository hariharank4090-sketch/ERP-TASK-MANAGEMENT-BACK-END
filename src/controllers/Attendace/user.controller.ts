import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ZodError } from 'zod';
import { Sequelize, DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';

import {
    userCreateSchema,
    userUpdateSchema,
    userIdSchema,
    userQuerySchema,
    UserCreateInput,
    UserUpdateInput,
    UserQueryParams,
    UserAttributes
} from '../../models/Attendance/user/User.model';

// Define the User class that extends Model
class User extends Model<UserAttributes, UserAttributes> implements UserAttributes {
    declare UserId: number;
    declare Global_User_ID: string | null;
    declare UserTypeId: number | null;
    declare Name: string | null;
    declare UserName: string | null;
    declare Password: string | null;
    declare Company_Id: number | null;
    declare BranchId: number | null;
    declare UDel_Flag: boolean | null;
    declare Autheticate_Id: string | null;

    static async getNextId(sequelize: Sequelize): Promise<number> {
        try {
            const result = await sequelize.query(
                'SELECT ISNULL(MAX(UserId), 0) + 1 as nextId FROM tbl_Users WHERE UserTypeId = 6',
                { 
                    type: 'SELECT' as any,
                    raw: true 
                }
            ) as any[];
            
            return result[0]?.nextId || 1;
        } catch (error) {
            console.error('Error getting next ID:', error);
            throw error;
        }
    }

    // Hash password before saving
    static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    // Verify password
    async verifyPassword(password: string): Promise<boolean> {
        if (!this.Password) return false;
        return bcrypt.compare(password, this.Password);
    }
}

// Function to initialize the model with a specific sequelize instance
function initializeUserModel(sequelize: Sequelize): typeof User {
    User.init(
        {
            UserId: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                field: 'UserId',
                allowNull: false,
            },
            Global_User_ID: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'Global_User_ID'
            },
            UserTypeId: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'UserTypeId',
                defaultValue: 6
            },
            Name: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'Name'
            },
            UserName: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'UserName',
                validate: {
                    notEmpty: true
                }
            },
            Password: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'Password'
            },
            Company_Id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'Company_Id'
            },
            BranchId: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'BranchId'
            },
            UDel_Flag: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
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
            sequelize,
            tableName: 'tbl_Users',
            modelName: 'User',
            timestamps: false,
            freezeTableName: true,
            hooks: {
                beforeCreate: async (user: User) => {
                    if (!user.UserId) {
                        const nextId = await User.getNextId(sequelize);
                        user.UserId = nextId;
                    }
                    // Force UserTypeId to be 6
                    user.UserTypeId = 6;
                    if (user.Password) {
                        user.Password = await User.hashPassword(user.Password);
                    }
                },
                beforeUpdate: async (user: User) => {
                    // Prevent changing UserTypeId from 6
                    if (user.changed('UserTypeId') && user.UserTypeId !== 6) {
                        user.UserTypeId = 6;
                    }
                    if (user.changed('Password') && user.Password) {
                        user.Password = await User.hashPassword(user.Password);
                    }
                }
            }
        }
    );
    return User;
}

/* ================= ZOD VALIDATION HELPER ================= */
const validateWithZod = <T>(schema: any, data: any) => {
    try {
        return { success: true, data: schema.parse(data) as T };
    } catch (err) {
        if (err instanceof ZodError) {
            return {
                success: false,
                errors: err.issues.map(e => ({
                    field: e.path.join('.') || 'unknown',
                    message: e.message
                }))
            };
        }
        return { success: false };
    }
};

/* ================= HELPER: Get Sequelize Instance from Request ================= */
const getSequelizeFromRequest = (req: Request): Sequelize => {
    // Use companyDB from middleware
    if (req.companyDB) {
        console.log(`✅ Using companyDB from request: ${(req.companyDB as any).config?.database || 'unknown'}`);
        return req.companyDB;
    }
    
    // Fallback to default connection
    console.log(`⚠️ No companyDB in request, using default connection`);
    const { getDefaultConnection } = require('../../../config/sequalizer');
    return getDefaultConnection();
};

/* ================= GET ALL ================= */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const UserModel = initializeUserModel(sequelizeInstance);
        
        const validation = validateWithZod<UserQueryParams>(
            userQuerySchema,
            req.query
        );

        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: validation.errors 
            });
        }

        const { 
            page = 1, 
            limit = 20, 
            search, 
            sortBy = 'UserId', 
            sortOrder = 'ASC',
            companyId,
            branchId,
            udelFlag
        } = validation.data!;

        const where: any = {
            UserTypeId: 6  // Always filter by UserTypeId = 6
        };

        if (search && search.trim()) {
            where[Op.or] = [
                { UserName: { [Op.like]: `%${search}%` } },
                { Name: { [Op.like]: `%${search}%` } },
                { Global_User_ID: { [Op.like]: `%${search}%` } }
            ];
        }

        if (companyId !== undefined) {
            where.Company_Id = companyId;
        }

        if (branchId !== undefined) {
            where.BranchId = branchId;
        }

        if (udelFlag !== undefined) {
            where.UDel_Flag = udelFlag;
        }

        const offset = (page - 1) * limit;

        const { rows, count } = await UserModel.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, sortOrder]],
            attributes: { exclude: ['Password'] } // Exclude password from results
        });

        const totalPages = Math.ceil(count / limit);

        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: rows,
            pagination: {
                totalRecords: count,
                currentPage: page,
                totalPages,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (e: any) {
        console.error('Get All Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= GET BY ID ================= */
export const getUserById = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const UserModel = initializeUserModel(sequelizeInstance);
        
        const validation = validateWithZod<{ id: number }>(
            userIdSchema,
            req.params
        );

        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid ID parameter' 
            });
        }

        const user = await UserModel.findOne({
            where: {
                UserId: validation.data!.id,
                UserTypeId: 6  // Only fetch users with UserTypeId = 6
            },
            attributes: { exclude: ['Password'] }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user
        });

    } catch (e: any) {
        console.error('Get By ID Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= CREATE ================= */
export const createUser = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const UserModel = initializeUserModel(sequelizeInstance);
        
        console.log('Request Body:', req.body);
        console.log(`📊 Using database: ${(sequelizeInstance as any).config?.database || 'unknown'}`);
        
        const validation = validateWithZod<UserCreateInput>(
            userCreateSchema,
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: validation.errors 
            });
        }

        const { UserName } = validation.data!;

        // Check for duplicate username among users with UserTypeId = 6
        const exists = await UserModel.findOne({
            where: {
                UserName: UserName,
                UserTypeId: 6
            }
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Get next ID
        const nextId = await UserModel.getNextId(sequelizeInstance);
        console.log(`📝 Next available ID: ${nextId}`);

        // Create the user - force UserTypeId to 6
        const user = await UserModel.create({
            ...validation.data!,
            UserId: nextId,
            UserTypeId: 6  // Force UserTypeId to 6
        });

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.Password;

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userResponse
        });

    } catch (e: any) {
        console.error('Create Error Details:', {
            name: e.name,
            message: e.message,
            parent: e.parent?.message,
            sql: e.sql
        });
        
        // Handle specific database errors
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'Username already exists',
                errors: e.errors.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        
        if (e.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                success: false,
                message: 'Database error occurred',
                error: e.parent?.message || e.message
            });
        }
        
        // Handle validation errors
        if (e.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: e.errors.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= UPDATE ================= */
export const updateUser = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const UserModel = initializeUserModel(sequelizeInstance);
        
        // Validate ID parameter
        const idValidation = validateWithZod<{ id: number }>(
            userIdSchema,
            req.params
        );

        if (!idValidation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid ID parameter' 
            });
        }

        // Validate request body
        const bodyValidation = validateWithZod<UserUpdateInput>(
            userUpdateSchema,
            req.body
        );

        if (!bodyValidation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: bodyValidation.errors 
            });
        }

        // Find the user (only users with UserTypeId = 6)
        const user = await UserModel.findOne({
            where: {
                UserId: idValidation.data!.id,
                UserTypeId: 6
            }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check for duplicate username (excluding current record)
        if (bodyValidation.data!.UserName) {
            const duplicate = await UserModel.findOne({
                where: {
                    UserName: bodyValidation.data!.UserName,
                    UserId: { [Op.ne]: user.UserId },
                    UserTypeId: 6
                }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
            }
        }

        // Remove UserTypeId from update data to prevent changing it
        const updateData = { ...bodyValidation.data! };
        delete updateData.UserTypeId;

        // Update the user
        await user.update(updateData);
        
        // Fetch updated record without password
        const updatedUser = await UserModel.findByPk(user.UserId, {
            attributes: { exclude: ['Password'] }
        });

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });

    } catch (e: any) {
        console.error('Update Error:', e);
        
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'Username already exists',
                errors: e.errors.map((err: any) => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        
        if (e.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                success: false,
                message: 'Database error occurred',
                error: e.parent?.message || e.message
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= DELETE (Soft Delete) ================= */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const UserModel = initializeUserModel(sequelizeInstance);
        
        const validation = validateWithZod<{ id: number }>(
            userIdSchema,
            req.params
        );

        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid ID parameter' 
            });
        }

        const user = await UserModel.findOne({
            where: {
                UserId: validation.data!.id,
                UserTypeId: 6
            }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Soft delete - set UDel_Flag to true
        await user.update({ UDel_Flag: true });
        
        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (e: any) {
        console.error('Delete Error:', e);
        
        if (e.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                success: false,
                message: 'Database error occurred',
                error: e.parent?.message || e.message
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= HARD DELETE (Permanent) ================= */
export const hardDeleteUser = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const UserModel = initializeUserModel(sequelizeInstance);
        
        const validation = validateWithZod<{ id: number }>(
            userIdSchema,
            req.params
        );

        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid ID parameter' 
            });
        }

        const user = await UserModel.findOne({
            where: {
                UserId: validation.data!.id,
                UserTypeId: 6
            }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Hard delete (permanent removal)
        await user.destroy();
        
        return res.status(200).json({
            success: true,
            message: 'User permanently deleted successfully'
        });

    } catch (e: any) {
        console.error('Hard Delete Error:', e);
        
        if (e.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                success: false,
                message: 'Database error occurred',
                error: e.parent?.message || e.message
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= RESTORE USER ================= */
export const restoreUser = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const UserModel = initializeUserModel(sequelizeInstance);
        
        const validation = validateWithZod<{ id: number }>(
            userIdSchema,
            req.params
        );

        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid ID parameter' 
            });
        }

        const user = await UserModel.findOne({
            where: {
                UserId: validation.data!.id,
                UserTypeId: 6
            }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Restore user - set UDel_Flag to false
        await user.update({ UDel_Flag: false });
        
        const restoredUser = await UserModel.findByPk(user.UserId, {
            attributes: { exclude: ['Password'] }
        });

        return res.status(200).json({
            success: true,
            message: 'User restored successfully',
            data: restoredUser
        });

    } catch (e: any) {
        console.error('Restore Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= DROPDOWN ================= */
export const getUserDropdown = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const UserModel = initializeUserModel(sequelizeInstance);
        
        const where: any = { 
            UserTypeId: 6,  // Only users with UserTypeId = 6
            UDel_Flag: false // Only active users
        };
        
        // Optional filters
        if (req.query.companyId) {
            where.Company_Id = parseInt(req.query.companyId as string);
        }
        if (req.query.branchId) {
            where.BranchId = parseInt(req.query.branchId as string);
        }
        
        const users = await UserModel.findAll({
            where,
            attributes: [
                ['UserId', 'value'],
                ['UserName', 'label']
            ],
            order: [['UserName', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Users for dropdown retrieved successfully',
            data: users
        });

    } catch (e: any) {
        console.error('Dropdown Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= CHANGE PASSWORD ================= */
export const changePassword = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const UserModel = initializeUserModel(sequelizeInstance);
        
        const validation = validateWithZod<{ id: number }>(
            userIdSchema,
            req.params
        );

        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid ID parameter' 
            });
        }

        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Old password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const user = await UserModel.findOne({
            where: {
                UserId: validation.data!.id,
                UserTypeId: 6
            }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify old password
        const isPasswordValid = await user.verifyPassword(oldPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Old password is incorrect'
            });
        }

        // Update password
        await user.update({ Password: newPassword });

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (e: any) {
        console.error('Change Password Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};