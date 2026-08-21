import { Request, Response } from 'express';
import sql from 'mssql';
import { getDefaultSqlConnection } from '../../../config/database.config';
import { invalidInput, failed, success, servError } from '../../../responseObject';

// Helper to convert inputs safely to BigInt strings
const toBigInt = (val: any): string => {
    return String(BigInt(val));
};

const USER_PORTAL_DB = process.env.USERPORTALDB || "User_Portal";
const FULL_TABLE_NAME = `[${USER_PORTAL_DB}].[dbo].[tbl_Ticket_Gen_Info]`;

export const getTickets = async (req: Request, res: Response) => {
    try {
        const pool = await getDefaultSqlConnection();

        const userIdRaw = req.params.User_Id || req.query.User_Id || req.userId;
        const companyIdRaw = req.query.companyId || req.query.Company_Id || req.currentCompanyId;

        if (!userIdRaw) {
            return invalidInput(res, "User_Id is required");
        }
        if (!companyIdRaw) {
            return invalidInput(res, "companyId is required");
        }
        if (!/^\d+$/.test(String(userIdRaw))) {
            return invalidInput(res, "User_Id must be a valid numeric id");
        }
        if (!/^\d+$/.test(String(companyIdRaw))) {
            return invalidInput(res, "companyId must be a valid numeric id");
        }

        const userId = toBigInt(userIdRaw);
        const requestedCompanyId = toBigInt(companyIdRaw);

        const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize as string, 10) || 50, 1), 200);
        const offset = (page - 1) * pageSize;

        const userResult = await pool.request()
            .input("User_Id", sql.BigInt, userId)
            .query(`
                SELECT UserTypeId, Company_Id
                FROM [${USER_PORTAL_DB}].[dbo].[tbl_Users]
                WHERE Global_User_Id = @User_Id
            `);

        if (!userResult.recordset.length) {
            return failed(res, "User not found");
        }

        const { UserTypeId: userTypeId, Company_Id: ownCompanyId } = userResult.recordset[0];

        const isAdmin = (userTypeId == 0 || userTypeId == 1);

        if (isAdmin) {
            if (ownCompanyId === null || ownCompanyId === undefined) {
                return res.status(403).json({
                    success: false,
                    message: "Your account is not associated with a company",
                    data: []
                });
            }
            if (String(toBigInt(ownCompanyId)) !== String(requestedCompanyId)) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view tickets for this company",
                    data: []
                });
            }
        }

        let query = `
          SELECT 
            t.*,
            u1.Name AS Created_By_Name,
            c.Category AS Category_Name,
            comp.Company_Name AS From_Company_Name,
            alloc.Est_Sch_Start_Date,
            alloc.Est_Sch_End_Date,
            alloc.T_Sch_Id,
            alloc.Employee_Involved_Id
        FROM ${FULL_TABLE_NAME} t
        LEFT JOIN [${USER_PORTAL_DB}].[dbo].[tbl_Users] u1 
            ON t.Created_By = u1.Global_User_Id
        LEFT JOIN [${USER_PORTAL_DB}].[dbo].[tbl_Category] c
            ON c.Id = t.Category
            AND c.Company_Id = t.From_CompanyId
        LEFT JOIN [${USER_PORTAL_DB}].[dbo].[tbl_Company] comp
            ON comp.Global_Comp_Id = t.From_CompanyId
        `;

        if (isAdmin) {
            query += `
            OUTER APPLY (
                SELECT 
                    ta.Est_Sch_Start_Date,
                    ta.Est_Sch_End_Date,
                    ta.T_Sch_Id,
                    tae.Employee_Involved_Id
                FROM [${USER_PORTAL_DB}].[dbo].[tbl_Ticket_Alloctation] ta
                LEFT JOIN [${USER_PORTAL_DB}].[dbo].[tbl_Ticket_Alloctation_Employees] tae 
                    ON ta.T_Sch_Id = tae.T_Sch_Id
                WHERE ta.T_Sch_Id = (
                    SELECT TOP 1 ta2.T_Sch_Id 
                    FROM [${USER_PORTAL_DB}].[dbo].[tbl_Ticket_Alloctation] ta2 
                    WHERE ta2.Ticket_Id = t.Id 
                    ORDER BY ta2.T_Sch_Id DESC
                )
            ) alloc
            `;
        } else {
            query += `
            OUTER APPLY (
                SELECT 
                    ta.Est_Sch_Start_Date,
                    ta.Est_Sch_End_Date,
                    ta.T_Sch_Id,
                    tae.Employee_Involved_Id
                FROM [${USER_PORTAL_DB}].[dbo].[tbl_Ticket_Alloctation] ta
                INNER JOIN [${USER_PORTAL_DB}].[dbo].[tbl_Ticket_Alloctation_Employees] tae 
                    ON ta.T_Sch_Id = tae.T_Sch_Id
                WHERE ta.Ticket_Id = t.Id
                  AND tae.Employee_Involved_Id = @User_Id
            ) alloc
            `;
        }

        const request = pool.request();
        request.input("Company_Id", sql.BigInt, requestedCompanyId);
        request.input("User_Id", sql.BigInt, userId);
        request.input("Offset", sql.Int, offset);
        request.input("PageSize", sql.Int, pageSize);

        const companyCondition = "(t.To_CompanyId = @Company_Id OR (t.To_CompanyId IS NULL AND t.From_CompanyId = @Company_Id))";

        let permissionCondition: string;
        if (isAdmin) {
            permissionCondition = '1=1';
        } else {
            permissionCondition = 'alloc.T_Sch_Id IS NOT NULL';
        }

        const whereClause = `WHERE ${companyCondition} AND ${permissionCondition}`;

        query += `
            ${whereClause}
            ORDER BY t.Created_At DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
        `;

        const result = await request.query(query);
        return success(res, "Tickets fetched successfully", result.recordset);

    } catch (err) {
        console.error('Get tickets error:', err);
        return servError(err, res);
    }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
    try {
        const { Id, Status } = req.body;

        if (!Id) {
            return invalidInput(res, "Id is required");
        }
        if (!Status) {
            return invalidInput(res, "Status is required");
        }

        const pool = await getDefaultSqlConnection();
        const result = await pool.request()
            .input("Id", sql.BigInt, Id)
            .input("Status", sql.VarChar, Status)
            .query(`
                UPDATE ${FULL_TABLE_NAME}
                SET Status = @Status
                WHERE Id = @Id
            `);

        if (result.rowsAffected[0] === 0) {
            return failed(res, "Ticket not found or status not updated");
        }

        return success(res, "Ticket status updated successfully", [{ Id, Status }]);
    } catch (err) {
        console.error('Update ticket status error:', err);
        return servError(err, res);
    }
};

