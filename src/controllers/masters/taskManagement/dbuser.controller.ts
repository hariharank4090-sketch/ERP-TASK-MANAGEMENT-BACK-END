import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ZodError } from 'zod';
import { User } from '../../../models/dropdown/dbusers.model';
import {
    userQuerySchema,
    userIdSchema,
    UserQueryParams
} from '../../../models/dropdown/dbusers.model';

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

/* ================= HELPER TO GET CURRENT DATABASE CONNECTION ================= */
const getCurrentSequelize = (req: Request) => {
    if (!req.companyDB) {
        throw new Error('Company database connection not found on request');
    }
    return req.companyDB;
};

/* ================= HELPER TO GET CURRENT DATABASE NAME ================= */
const getCurrentDatabaseName = (req: Request): string => {
    return req.currentDBName || 'unknown';
};

/* ================= GET USER MODEL WITH CURRENT DB ================= */
const getUserModel = (req: Request): typeof User => {
    const sequelizeInstance = getCurrentSequelize(req);
    const dbName = getCurrentDatabaseName(req);
    
    console.log(`\n📊 Using database: ${dbName} for User operations`);
    console.log(`🔗 Sequelize instance: ${sequelizeInstance.config.database}`);
    
    // Initialize User model with current sequelize instance
    return User.initialize(sequelizeInstance);
};

/* ================= GET ALL USERS USING RAW SQL ================= */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
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
            search, 
            sortBy = 'UserId', 
            sortOrder = 'ASC',
            companyId,
            branchId,
            userTypeId,
            activeOnly = true
        } = validation.data!;

        const sequelizeInstance = getCurrentSequelize(req);
        const dbName = getCurrentDatabaseName(req);

        let whereClause = '';
        const replacements: any = {};

        // Add active filter
        if (activeOnly) {
            whereClause += ' AND [UDel_Flag] = 0';
        }

        // Add search filter
        if (search && search.trim()) {
            whereClause += ` AND ([Name] LIKE @search OR [UserName] LIKE @search OR [Global_User_ID] LIKE @search)`;
            replacements.search = `%${search}%`;
        }

        // Add company filter
        if (companyId) {
            whereClause += ` AND [Company_Id] = @companyId`;
            replacements.companyId = companyId;
        }

        // Add branch filter
        if (branchId) {
            whereClause += ` AND [BranchId] = @branchId`;
            replacements.branchId = branchId;
        }

        // Add user type filter
        if (userTypeId) {
            whereClause += ` AND [UserTypeId] = @userTypeId`;
            replacements.userTypeId = userTypeId;
        }

        const orderBy = `ORDER BY [${sortBy}] ${sortOrder}`;

        // Get all data without pagination
        const dataQuery = `
            SELECT 
                [UserId],
                [Global_User_ID],
                [UserTypeId],
                [Name],
                [UserName],
                [Company_Id],
                [BranchId],
                [UDel_Flag],
                [Autheticate_Id]
            FROM [tbl_Users] 
            WHERE 1=1 ${whereClause}
            ${orderBy}
        `;

        const rows = await sequelizeInstance.query(dataQuery, {
            replacements,
            type: 'SELECT'
        });

        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            database: dbName,
            count: (rows as any[]).length,
            data: rows
        });

    } catch (e: any) {
        console.error('Get All Users Error:', e);
        return res.status(500).json({
            success: false,
            message: e.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= GET USER BY ID ================= */
export const getUserById = async (req: Request, res: Response) => {
    try {
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

        const sequelizeInstance = getCurrentSequelize(req);
        const dbName = getCurrentDatabaseName(req);
        const userId = validation.data!.id;

        const query = `
            SELECT 
                [UserId],
                [Global_User_ID],
                [UserTypeId],
                [Name],
                [UserName],
                [Company_Id],
                [BranchId],
                [UDel_Flag],
                [Autheticate_Id]
            FROM [tbl_Users] 
            WHERE [UserId] = @userId
        `;

        const users = await sequelizeInstance.query(query, {
            replacements: { userId },
            type: 'SELECT'
        });

        const user = (users as any[])[0];
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            database: dbName,
            data: user
        });

    } catch (e: any) {
        console.error('Get User By ID Error:', e);
        return res.status(500).json({
            success: false,
            message: e.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= GET USER DROPDOWN ================= */
export const getUserDropdown = async (req: Request, res: Response) => {
    try {
        const { companyId, branchId, activeOnly = true } = req.query;
        
        const sequelizeInstance = getCurrentSequelize(req);
        const dbName = getCurrentDatabaseName(req);
        
        let whereClause = '';
        const replacements: any = {};
        
        if (activeOnly === 'true' || activeOnly === true) {
            whereClause += ' AND [UDel_Flag] = 0';
        }
        
        if (companyId) {
            whereClause += ` AND [Company_Id] = @companyId`;
            replacements.companyId = parseInt(companyId as string);
        }
        
        if (branchId) {
            whereClause += ` AND [BranchId] = @branchId`;
            replacements.branchId = parseInt(branchId as string);
        }

        const query = `
            SELECT 
                [UserId] as value,
                [Name] as label,
                [UserName],
                [UserTypeId]
            FROM [tbl_Users] 
            WHERE 1=1 ${whereClause}
            ORDER BY [Name] ASC
        `;

        const users = await sequelizeInstance.query(query, {
            replacements,
            type: 'SELECT'
        });

        return res.status(200).json({
            success: true,
            message: 'Users for dropdown retrieved successfully',
            database: dbName,
            count: (users as any[]).length,
            data: users
        });

    } catch (e: any) {
        console.error('User Dropdown Error:', e);
        return res.status(500).json({
            success: false,
            message: e.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= GET DELETED USERS ================= */
export const getDeletedUsers = async (req: Request, res: Response) => {
    try {
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
            search, 
            sortBy = 'UserId', 
            sortOrder = 'ASC'
        } = validation.data!;

        const sequelizeInstance = getCurrentSequelize(req);
        const dbName = getCurrentDatabaseName(req);

        let whereClause = ' WHERE [UDel_Flag] = 1';
        const replacements: any = {};

        // Add search filter
        if (search && search.trim()) {
            whereClause += ` AND ([Name] LIKE @search OR [UserName] LIKE @search)`;
            replacements.search = `%${search}%`;
        }

        const orderBy = `ORDER BY [${sortBy}] ${sortOrder}`;

        // Get all deleted users without pagination
        const dataQuery = `
            SELECT 
                [UserId],
                [Global_User_ID],
                [UserTypeId],
                [Name],
                [UserName],
                [Company_Id],
                [BranchId],
                [UDel_Flag],
                [Autheticate_Id]
            FROM [tbl_Users] 
            ${whereClause}
            ${orderBy}
        `;

        const rows = await sequelizeInstance.query(dataQuery, {
            replacements,
            type: 'SELECT'
        });

        return res.status(200).json({
            success: true,
            message: 'Deleted users retrieved successfully',
            database: dbName,
            count: (rows as any[]).length,
            data: rows
        });

    } catch (e: any) {
        console.error('Get Deleted Users Error:', e);
        return res.status(500).json({
            success: false,
            message: e.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= GET USERS BY COMPANY ================= */
export const getUsersByCompany = async (req: Request, res: Response) => {
    try {
        const companyId = parseInt(req.params.companyId);
        
        if (isNaN(companyId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid company ID'
            });
        }

        const sequelizeInstance = getCurrentSequelize(req);
        const dbName = getCurrentDatabaseName(req);

        const query = `
            SELECT 
                [UserId],
                [Global_User_ID],
                [UserTypeId],
                [Name],
                [UserName],
                [Company_Id],
                [BranchId],
                [UDel_Flag],
                [Autheticate_Id]
            FROM [tbl_Users] 
            WHERE [Company_Id] = @companyId AND [UDel_Flag] = 0
            ORDER BY [Name] ASC
        `;

        const users = await sequelizeInstance.query(query, {
            replacements: { companyId },
            type: 'SELECT'
        });

        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            database: dbName,
            count: (users as any[]).length,
            data: users
        });

    } catch (e: any) {
        console.error('Get Users By Company Error:', e);
        return res.status(500).json({
            success: false,
            message: e.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= GET USERS BY BRANCH ================= */
export const getUsersByBranch = async (req: Request, res: Response) => {
    try {
        const branchId = parseInt(req.params.branchId);
        
        if (isNaN(branchId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid branch ID'
            });
        }

        const sequelizeInstance = getCurrentSequelize(req);
        const dbName = getCurrentDatabaseName(req);

        const query = `
            SELECT 
                [UserId],
                [Global_User_ID],
                [UserTypeId],
                [Name],
                [UserName],
                [Company_Id],
                [BranchId],
                [UDel_Flag],
                [Autheticate_Id]
            FROM [tbl_Users] 
            WHERE [BranchId] = @branchId AND [UDel_Flag] = 0
            ORDER BY [Name] ASC
        `;

        const users = await sequelizeInstance.query(query, {
            replacements: { branchId },
            type: 'SELECT'
        });

        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            database: dbName,
            count: (users as any[]).length,
            data: users
        });

    } catch (e: any) {
        console.error('Get Users By Branch Error:', e);
        return res.status(500).json({
            success: false,
            message: e.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= GET USERS BY TYPE ================= */
export const getUsersByType = async (req: Request, res: Response) => {
    try {
        const userTypeId = parseInt(req.params.userTypeId);
        
        if (isNaN(userTypeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user type ID'
            });
        }

        const sequelizeInstance = getCurrentSequelize(req);
        const dbName = getCurrentDatabaseName(req);

        const query = `
            SELECT 
                [UserId],
                [Global_User_ID],
                [UserTypeId],
                [Name],
                [UserName],
                [Company_Id],
                [BranchId],
                [UDel_Flag],
                [Autheticate_Id]
            FROM [tbl_Users] 
            WHERE [UserTypeId] = @userTypeId AND [UDel_Flag] = 0
            ORDER BY [Name] ASC
        `;

        const users = await sequelizeInstance.query(query, {
            replacements: { userTypeId },
            type: 'SELECT'
        });

        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            database: dbName,
            count: (users as any[]).length,
            data: users
        });

    } catch (e: any) {
        console.error('Get Users By Type Error:', e);
        return res.status(500).json({
            success: false,
            message: e.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= TEST CONNECTION ================= */
export const testConnection = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getCurrentSequelize(req);
        const dbName = getCurrentDatabaseName(req);
        
        // Test query
        const query = 'SELECT COUNT(*) as count FROM [tbl_Users]';
        const result = await sequelizeInstance.query(query, { type: 'SELECT' });
        const count = (result as any[])[0]?.count || 0;
        
        return res.status(200).json({
            success: true,
            message: 'Database connection successful',
            database: dbName,
            userCount: count,
            timestamp: new Date().toISOString()
        });
        
    } catch (e: any) {
        console.error('Test Connection Error:', e);
        return res.status(500).json({
            success: false,
            message: e.message || 'Database connection failed',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};