// helper_functions.ts
import sql from 'mssql';
import { Request } from 'express';
import { getDefaultSqlConnection, getCompanySqlConnection, verifyTokenSession } from '../config/database.config';

export const checkIsNumber = (value: any): boolean => {
    return !isNaN(Number(value)) && value !== null && value !== undefined;
};

export const isValidNumber = (value: any): boolean => {
    return !isNaN(Number(value)) && value !== null && value !== undefined && Number(value) > 0;
};

export const isEqualNumber = (a: number, b: number): boolean => {
    return Number(a) === Number(b);
};

export const stringCompare = (str1: string, str2: string): boolean => {
    return str1?.toLowerCase() === str2?.toLowerCase();
};

// Extract token from Authorization header
export const extractToken = (authHeader?: string): string | null => {
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
    }
    return authHeader.trim();
};

// Get connection pool based on company from request or token
const getConnectionPoolForCompany = async (req?: Request): Promise<sql.ConnectionPool> => {
    // Try to get companyId from request
    let companyId = (req as any)?.companyId || (req as any)?.currentCompanyId;
    
    // If not in request, try to get from token
    if (!companyId && req) {
        const authHeader = req.headers.authorization;
        const token = extractToken(authHeader);
        if (token) {
            const session = verifyTokenSession(token);
            if (session) {
                companyId = session.companyId;
            }
        }
    }
    
    if (companyId && companyId > 0) {
        return await getCompanySqlConnection(companyId);
    }
    
    // Fallback to default connection
    return await getDefaultSqlConnection();
};

export const getUserTypeByAuth = async (authToken: string, req?: Request): Promise<number | false> => {
    // Extract clean token (remove "Bearer " prefix if present)
    const cleanToken = extractToken(authToken);
    
    if (!cleanToken) {
        console.error('❌ No valid token provided to getUserTypeByAuth');
        return false;
    }

    try {
        console.log(`🔍 Looking up user with token: ${cleanToken.substring(0, 30)}...`);
        
        // Get connection to User Portal DB
        const defaultPool = await getDefaultSqlConnection();
        
        const userResult = await defaultPool.request()
            .input('Auth', cleanToken)
            .query(`
                SELECT 
                    u.Global_User_ID,
                    u.UserTypeId, 
                    u.Company_Id, 
                    u.Autheticate_Id,
                    u.UserName,
                    u.Name
                FROM [dbo].[tbl_Users] u
                WHERE u.Autheticate_Id = @Auth AND u.UDel_Flag = 0
            `);

        if (userResult.recordset.length === 0) {
            console.error(`❌ No user found for token: ${cleanToken.substring(0, 30)}...`);
            return false;
        }

        const user = userResult.recordset[0];
        console.log(`✅ User found: ${user.UserName}, Global_User_ID: ${user.Global_User_ID}, UserTypeId: ${user.UserTypeId}, Company_Id: ${user.Company_Id}`);
        
        // Store company ID and user info in request for later use
        if (req) {
            if (user.Company_Id) {
                (req as any).companyId = user.Company_Id;
                (req as any).currentCompanyId = user.Company_Id;
            }
            (req as any).userId = user.Global_User_ID;
            (req as any).globalUserId = user.Global_User_ID;
            (req as any).userTypeId = user.UserTypeId;
        }

        // If UserTypeId is directly in tbl_Users, return it
        if (user.UserTypeId && user.UserTypeId > 0) {
            console.log(`✅ UserTypeId from User Portal: ${user.UserTypeId}`);
            return Number(user.UserTypeId);
        }

        console.error(`❌ Could not determine UserTypeId for token`);
        return false;

    } catch (e) {
        console.error('❌ getUserTypeByAuth error:', e);
        return false;
    }
};

export const getUserIdByAuth = async (authToken: string, req?: Request): Promise<number | false> => {
    // Extract clean token
    const cleanToken = extractToken(authToken);
    
    if (!cleanToken) return false;

    try {
        const pool = await getDefaultSqlConnection();
        const result = await pool.request()
            .input('Auth', cleanToken)
            .query(`
                SELECT Global_User_ID, Company_Id
                FROM [dbo].[tbl_Users] 
                WHERE Autheticate_Id = @Auth AND UDel_Flag = 0
            `);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            if (req && user.Company_Id) {
                (req as any).companyId = user.Company_Id;
                (req as any).currentCompanyId = user.Company_Id;
            }
            console.log(`✅ Found Global_User_ID: ${user.Global_User_ID}`);
            return Number(user.Global_User_ID);
        }
        console.error(`❌ No user found for token`);
        return false;
    } catch (e) {
        console.error('❌ getUserIdByAuth error:', e);
        return false;
    }
};

export const getUserType = async (GlobalUserId: number, req?: Request): Promise<number | false> => {
    if (!checkIsNumber(GlobalUserId)) return false;

    try {
        const pool = await getDefaultSqlConnection();
        const result = await pool.request()
            .input('GlobalUserId', GlobalUserId)
            .query(`
                SELECT UserTypeId
                FROM [dbo].[tbl_Users]
                WHERE Global_User_ID = @GlobalUserId AND UDel_Flag = 0
            `);

        if (result.recordset.length > 0 && result.recordset[0].UserTypeId) {
            return Number(result.recordset[0].UserTypeId);
        }
        return false;
    } catch (e) {
        console.error('❌ getUserType error:', e);
        return false;
    }
};

export const getCustomerIdByGlobalUserId = async (GlobalUserId: number, req?: Request): Promise<number | false> => {
    if (!checkIsNumber(GlobalUserId)) return false;

    try {
        const pool = await getConnectionPoolForCompany(req);
        const result = await pool.request()
            .input('GlobalUserId', GlobalUserId)
            .query(`
                SELECT TOP 1 Cust_Id
                FROM tbl_Customer_Master
                WHERE User_Mgt_Id = @GlobalUserId
            `);

        if (result.recordset.length > 0 && result.recordset[0].Cust_Id) {
            return Number(result.recordset[0].Cust_Id);
        }
        return false;
    } catch (e) {
        console.error('❌ getCustomerIdByGlobalUserId error:', e);
        return false;
    }
};

// Alias for backward compatibility
export const getCustomerIdByUserId = getCustomerIdByGlobalUserId;

interface MenuRightsRow {
    Read_Rights: number;
    Add_Rights: number;
    Edit_Rights: number;
    Delete_Rights: number;
    Print_Rights: number;
    [key: string]: unknown;
}

export const getUserTypeBasedRights = async (usertype: number, req?: Request): Promise<MenuRightsRow[] | false> => {
    if (!checkIsNumber(usertype)) return false;
    
    try {
        const pool = await getConnectionPoolForCompany(req);
        const result = await pool.request()
            .input('usertype', usertype)
            .query(`
                SELECT 
                    m.*,
                    COALESCE(utr.Read_Rights, 0) AS Read_Rights,
                    COALESCE(utr.Add_Rights, 0) AS Add_Rights,
                    COALESCE(utr.Edit_Rights, 0) AS Edit_Rights,
                    COALESCE(utr.Delete_Rights, 0) AS Delete_Rights,
                    COALESCE(utr.Print_Rights, 0) AS Print_Rights
                FROM tbl_AppMenu m
                LEFT JOIN tbl_AppMenu_UserTypeRights utr
                    ON utr.UserTypeId = @usertype AND utr.MenuId = m.id
                ORDER BY m.id
            `);
        return result.recordset as MenuRightsRow[];
    } catch (e) {
        console.error('❌ getUserTypeBasedRights error:', e);
        return false;
    }
};

export const getUserBasedRights = async (globalUserId: number, req?: Request): Promise<MenuRightsRow[] | false> => {
    if (!checkIsNumber(globalUserId)) return false;

    try {
        const pool = await getConnectionPoolForCompany(req);
        const result = await pool.request()
            .input('globalUserId', globalUserId)
            .query(`
                SELECT 
                    m.*,
                    COALESCE(ur.Read_Rights, 0) AS Read_Rights,
                    COALESCE(ur.Add_Rights, 0) AS Add_Rights,
                    COALESCE(ur.Edit_Rights, 0) AS Edit_Rights,
                    COALESCE(ur.Delete_Rights, 0) AS Delete_Rights,
                    COALESCE(ur.Print_Rights, 0) AS Print_Rights
                FROM tbl_AppMenu m
                LEFT JOIN tbl_AppMenu_UserRights ur
                    ON ur.UserId = @globalUserId AND ur.MenuId = m.id
                ORDER BY m.id
            `);
        return result.recordset as MenuRightsRow[];
    } catch (e) {
        console.error('❌ getUserBasedRights error:', e);
        return false;
    }
};

export const getUserMenuRights = async (authToken: string, req?: Request): Promise<MenuRightsRow[] | false> => {
    try {
        // Extract clean token
        const cleanToken = extractToken(authToken);
        
        if (!cleanToken) {
            console.error('❌ No valid token provided to getUserMenuRights');
            return false;
        }
        
        console.log(`🔍 Getting menu rights for token: ${cleanToken.substring(0, 30)}...`);
        
        const UserTypeId = await getUserTypeByAuth(cleanToken, req);
        
        if (UserTypeId === false) {
            console.error(`❌ Could not get UserTypeId`);
            return false;
        }

        console.log(`✅ UserTypeId: ${UserTypeId}`);
        
        const pool = await getConnectionPoolForCompany(req);

        // Admin (0) and Management (1) users get all permissions
        if (isEqualNumber(UserTypeId, 0) || isEqualNumber(UserTypeId, 1)) {
            console.log(`👑 Admin/Management user - granting full permissions`);
            const result = await pool.request().query(`
                SELECT 
                    *, 
                    1 AS Read_Rights, 
                    1 AS Add_Rights, 
                    1 AS Edit_Rights, 
                    1 AS Delete_Rights, 
                    1 AS Print_Rights
                FROM tbl_AppMenu
                WHERE is_active = 1
                ORDER BY display_order, id
            `);
            return result.recordset as MenuRightsRow[];
        } else {
            const GlobalUserId = await getUserIdByAuth(cleanToken, req);
            
            if (GlobalUserId === false) {
                console.error(`❌ Could not get GlobalUserId`);
                return false;
            }
            
            console.log(`👤 Regular user - checking specific rights for GlobalUserId: ${GlobalUserId}`);
            
            const result = await pool.request()
                .input('globalUserId', GlobalUserId)
                .input('usertype', UserTypeId)
                .query(`
                    SELECT 
                        m.*,
                        COALESCE(ur.Read_Rights, utr.Read_Rights, 0) AS Read_Rights,
                        COALESCE(ur.Add_Rights, utr.Add_Rights, 0) AS Add_Rights,
                        COALESCE(ur.Edit_Rights, utr.Edit_Rights, 0) AS Edit_Rights,
                        COALESCE(ur.Delete_Rights, utr.Delete_Rights, 0) AS Delete_Rights,
                        COALESCE(ur.Print_Rights, utr.Print_Rights, 0) AS Print_Rights
                    FROM tbl_AppMenu m
                    LEFT JOIN tbl_AppMenu_UserRights ur ON ur.UserId = @globalUserId AND ur.MenuId = m.id
                    LEFT JOIN tbl_AppMenu_UserTypeRights utr ON utr.UserTypeId = @usertype AND utr.MenuId = m.id
                    WHERE m.is_active = 1
                    ORDER BY m.display_order, m.id
                `);
            return result.recordset as MenuRightsRow[];
        }
    } catch (e) {
        console.error('❌ getUserMenuRights error:', e);
        return false;
    }
};