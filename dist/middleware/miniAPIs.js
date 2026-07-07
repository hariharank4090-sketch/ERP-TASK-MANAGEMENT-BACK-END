"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserMenuRights = exports.getUserBasedRights = exports.getUserTypeBasedRights = exports.getCustomerIdByUserId = exports.getCustomerIdByGlobalUserId = exports.getUserType = exports.getUserIdByAuth = exports.getUserTypeByAuth = exports.extractToken = exports.stringCompare = exports.isEqualNumber = exports.isValidNumber = exports.checkIsNumber = void 0;
const database_config_1 = require("../config/database.config");
const checkIsNumber = (value) => {
    return !isNaN(Number(value)) && value !== null && value !== undefined;
};
exports.checkIsNumber = checkIsNumber;
const isValidNumber = (value) => {
    return !isNaN(Number(value)) && value !== null && value !== undefined && Number(value) > 0;
};
exports.isValidNumber = isValidNumber;
const isEqualNumber = (a, b) => {
    return Number(a) === Number(b);
};
exports.isEqualNumber = isEqualNumber;
const stringCompare = (str1, str2) => {
    return str1?.toLowerCase() === str2?.toLowerCase();
};
exports.stringCompare = stringCompare;
// Extract token from Authorization header
const extractToken = (authHeader) => {
    if (!authHeader)
        return null;
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
    }
    return authHeader.trim();
};
exports.extractToken = extractToken;
// Get connection pool based on company from request or token
const getConnectionPoolForCompany = async (req) => {
    // Try to get companyId from request
    let companyId = req?.companyId || req?.currentCompanyId;
    // If not in request, try to get from token
    if (!companyId && req) {
        const authHeader = req.headers.authorization;
        const token = (0, exports.extractToken)(authHeader);
        if (token) {
            const session = (0, database_config_1.verifyTokenSession)(token);
            if (session) {
                companyId = session.companyId;
            }
        }
    }
    if (companyId && companyId > 0) {
        return await (0, database_config_1.getCompanySqlConnection)(companyId);
    }
    // Fallback to default connection
    return await (0, database_config_1.getDefaultSqlConnection)();
};
const getUserTypeByAuth = async (authToken, req) => {
    // Extract clean token (remove "Bearer " prefix if present)
    const cleanToken = (0, exports.extractToken)(authToken);
    if (!cleanToken) {
        console.error('❌ No valid token provided to getUserTypeByAuth');
        return false;
    }
    try {
        console.log(`🔍 Looking up user with token: ${cleanToken.substring(0, 30)}...`);
        // Get connection to User Portal DB
        const defaultPool = await (0, database_config_1.getDefaultSqlConnection)();
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
                req.companyId = user.Company_Id;
                req.currentCompanyId = user.Company_Id;
            }
            req.userId = user.Global_User_ID;
            req.globalUserId = user.Global_User_ID;
            req.userTypeId = user.UserTypeId;
        }
        // If UserTypeId is directly in tbl_Users, return it
        if (user.UserTypeId && user.UserTypeId > 0) {
            console.log(`✅ UserTypeId from User Portal: ${user.UserTypeId}`);
            return Number(user.UserTypeId);
        }
        console.error(`❌ Could not determine UserTypeId for token`);
        return false;
    }
    catch (e) {
        console.error('❌ getUserTypeByAuth error:', e);
        return false;
    }
};
exports.getUserTypeByAuth = getUserTypeByAuth;
const getUserIdByAuth = async (authToken, req) => {
    // Extract clean token
    const cleanToken = (0, exports.extractToken)(authToken);
    if (!cleanToken)
        return false;
    try {
        const pool = await (0, database_config_1.getDefaultSqlConnection)();
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
                req.companyId = user.Company_Id;
                req.currentCompanyId = user.Company_Id;
            }
            console.log(`✅ Found Global_User_ID: ${user.Global_User_ID}`);
            return Number(user.Global_User_ID);
        }
        console.error(`❌ No user found for token`);
        return false;
    }
    catch (e) {
        console.error('❌ getUserIdByAuth error:', e);
        return false;
    }
};
exports.getUserIdByAuth = getUserIdByAuth;
const getUserType = async (GlobalUserId, req) => {
    if (!(0, exports.checkIsNumber)(GlobalUserId))
        return false;
    try {
        const pool = await (0, database_config_1.getDefaultSqlConnection)();
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
    }
    catch (e) {
        console.error('❌ getUserType error:', e);
        return false;
    }
};
exports.getUserType = getUserType;
const getCustomerIdByGlobalUserId = async (GlobalUserId, req) => {
    if (!(0, exports.checkIsNumber)(GlobalUserId))
        return false;
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
    }
    catch (e) {
        console.error('❌ getCustomerIdByGlobalUserId error:', e);
        return false;
    }
};
exports.getCustomerIdByGlobalUserId = getCustomerIdByGlobalUserId;
// Alias for backward compatibility
exports.getCustomerIdByUserId = exports.getCustomerIdByGlobalUserId;
const getUserTypeBasedRights = async (usertype, req) => {
    if (!(0, exports.checkIsNumber)(usertype))
        return false;
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
        return result.recordset;
    }
    catch (e) {
        console.error('❌ getUserTypeBasedRights error:', e);
        return false;
    }
};
exports.getUserTypeBasedRights = getUserTypeBasedRights;
const getUserBasedRights = async (globalUserId, req) => {
    if (!(0, exports.checkIsNumber)(globalUserId))
        return false;
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
        return result.recordset;
    }
    catch (e) {
        console.error('❌ getUserBasedRights error:', e);
        return false;
    }
};
exports.getUserBasedRights = getUserBasedRights;
const getUserMenuRights = async (authToken, req) => {
    try {
        // Extract clean token
        const cleanToken = (0, exports.extractToken)(authToken);
        if (!cleanToken) {
            console.error('❌ No valid token provided to getUserMenuRights');
            return false;
        }
        console.log(`🔍 Getting menu rights for token: ${cleanToken.substring(0, 30)}...`);
        const UserTypeId = await (0, exports.getUserTypeByAuth)(cleanToken, req);
        if (UserTypeId === false) {
            console.error(`❌ Could not get UserTypeId`);
            return false;
        }
        console.log(`✅ UserTypeId: ${UserTypeId}`);
        const pool = await getConnectionPoolForCompany(req);
        // Admin (0) and Management (1) users get all permissions
        if ((0, exports.isEqualNumber)(UserTypeId, 0) || (0, exports.isEqualNumber)(UserTypeId, 1)) {
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
            return result.recordset;
        }
        else {
            const GlobalUserId = await (0, exports.getUserIdByAuth)(cleanToken, req);
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
            return result.recordset;
        }
    }
    catch (e) {
        console.error('❌ getUserMenuRights error:', e);
        return false;
    }
};
exports.getUserMenuRights = getUserMenuRights;
