// import { Request, Response } from 'express';
// import {
//     created,
//     updated,
//     deleted,
//     servError,
//     notFound,
//     sentData
// } from '../../../responseObject';
// import {
//     initCompanyModel,
//     companyCreateSchema,
//     companyUpdateSchema,
//     companyQuerySchema,
//     companyIdSchema,
//     CompanyCreateInput,
//     CompanyUpdateInput,
//     CompanyQueryParams
// } from '../../../models/masters/companyMaster/type.model';
// import { ZodError } from 'zod';
// import { getCurrentSequelize, getCurrentDatabaseName } from '../../../config/sequalizer';

// const validateWithZod = <T>(schema: any, data: any): {
//     success: boolean;
//     data?: T;
//     errors?: Array<{ field: string; message: string }>
// } => {
//     try {
//         const validatedData = schema.parse(data);
//         return { success: true, data: validatedData };
//     } catch (error: any) {
//         if (error instanceof ZodError) {
//             return {
//                 success: false,
//                 errors: error.issues.map(err => ({
//                     field: err.path.join('.'),
//                     message: err.message
//                 }))
//             };
//         }
//         return { success: false };
//     }
// };

// // Helper function to get Company_Master model for current database
// const getCompanyModel = (req: Request) => {
//     const sequelize = getCurrentSequelize(req);
//     // Initialize the model with the current Sequelize instance
//     return initCompanyModel(sequelize);
// };

// export const getAllCompanies = async (req: Request, res: Response) => {
//     try {
//         const queryData = {
//             ...req.query
//         };

//         const validation = validateWithZod<CompanyQueryParams>(
//             companyQuerySchema,
//             queryData
//         );

//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid query parameters',
//                 errors: validation.errors
//             });
//         }

//         const queryParams = validation.data!;
//         const sequelize = getCurrentSequelize(req);
//         const dbName = getCurrentDatabaseName(req);
        
//         console.log(`📊 getAllCompanies - Database: ${dbName}`);

//         const whereConditions: string[] = [];
//         const queryParamsArray: any[] = [];

//         if (queryParams.active === 'true') {
//             whereConditions.push('cm.Del_Flag = 0');
//         } else if (queryParams.active === 'false') {
//             whereConditions.push('cm.Del_Flag = 1');
//         }

//         if (queryParams.search) {
//             whereConditions.push('(cm.Company_Code LIKE ? OR cm.Company_Name LIKE ?)');
//             queryParamsArray.push(`%${queryParams.search}%`, `%${queryParams.search}%`);
//         }

//         if (queryParams.state) {
//             whereConditions.push('cm.State = ?');
//             queryParamsArray.push(queryParams.state);
//         }

//         if (queryParams.country) {
//             whereConditions.push('cm.Country = ?');
//             queryParamsArray.push(queryParams.country);
//         }

//         const whereClause = whereConditions.length > 0 
//             ? `WHERE ${whereConditions.join(' AND ')}` 
//             : '';

//         // Use parameterized pagination
//         const offset = (queryParams.page - 1) * queryParams.limit;
//         const limit = queryParams.limit;

//         // Count query
//         const countQuery = `
//             SELECT COUNT(*) as total 
//             FROM tbl_Company_Master cm
//             ${whereClause}
//         `;
        
//         const countResult = await sequelize.query(countQuery, {
//             replacements: queryParamsArray,
//             type: 'SELECT'
//         }) as any[];
        
//         const totalRecords = countResult[0]?.total || 0;

//         // Valid sort fields
//         const validSortFields = ['Company_id', 'Company_Code', 'Company_Name', 'State', 'Country', 'Entry_Date'];
//         let orderField = queryParams.sortBy || 'Company_id';
        
//         if (!validSortFields.includes(orderField)) {
//             orderField = 'Company_id';
//         }
        
//         const orderDirection = queryParams.sortOrder || 'ASC';

//         // Data query with pagination
//         const dataQueryReplacements = [...queryParamsArray, offset, limit];

//         const dataQuery = `
//             SELECT 
//                 cm.Company_id,
//                 cm.Company_Code,
//                 cm.Company_Name,
//                 cm.Company_Address,
//                 cm.State,
//                 cm.Region,
//                 cm.Pincode,
//                 cm.Country,
//                 cm.VAT_TIN_Number,
//                 cm.PAN_Number,
//                 cm.CST_Number,
//                 cm.CIN_Number,
//                 cm.Service_Tax_Number,
//                 cm.MSME_Number,
//                 cm.NSIC_Number,
//                 cm.Account_Number,
//                 cm.IFC_Code,
//                 cm.Bank_Branch_Name,
//                 cm.Bank_Name,
//                 cm.Telephone_Number,
//                 cm.Support_Number,
//                 cm.Mail,
//                 cm.Website,
//                 cm.Gst_Number,
//                 cm.State_Code,
//                 cm.State_No,
//                 cm.Entry_By,
//                 cm.Entry_Date,
//                 cm.Modified_By,
//                 cm.Modified_Date,
//                 cm.Del_Flag,
//                 cm.Deleted_By,
//                 cm.Deleted_Date
//             FROM tbl_Company_Master cm
//             ${whereClause}
//             ORDER BY ${orderField} ${orderDirection}
//             OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
//         `;

//         const rows = await sequelize.query(dataQuery, {
//             replacements: dataQueryReplacements,
//             type: 'SELECT'
//         }) as any[];

//         // Return with pagination metadata
//         return res.status(200).json({
//             success: true,
//             data: rows,
//             pagination: {
//                 page: queryParams.page,
//                 limit: queryParams.limit,
//                 total: totalRecords,
//                 totalPages: Math.ceil(totalRecords / queryParams.limit)
//             },
//             database: dbName
//         });

//     } catch (err) {
//         console.error('Error fetching companies:', err);
//         servError(err, res);
//     }
// };

// // Get company by ID
// export const getCompanyById = async (req: Request, res: Response) => {
//     try {
//         const validation = validateWithZod<{ id: number }>(
//             companyIdSchema,
//             req.params
//         );

//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid ID parameter',
//                 errors: validation.errors
//             });
//         }

//         const { id } = validation.data!;
//         const sequelize = getCurrentSequelize(req);
//         const dbName = getCurrentDatabaseName(req);

//         const query = `
//             SELECT * FROM tbl_Company_Master 
//             WHERE Company_id = ? AND Del_Flag = 0
//         `;

//         const result = await sequelize.query(query, {
//             replacements: [id],
//             type: 'SELECT'
//         }) as any[];

//         if (result.length === 0) {
//             return notFound(res, 'Company not found');
//         }

//         sentData(res, { ...result[0], database: dbName });

//     } catch (e) {
//         console.error('Error fetching company by ID:', e);
//         servError(e, res);
//     }
// };

// // Get all active companies (for dropdowns)
// export const getAllActiveCompanies = async (req: Request, res: Response) => {
//     try {
//         const sequelize = getCurrentSequelize(req);
//         const dbName = getCurrentDatabaseName(req);

//         const query = `
//             SELECT 
//                 Company_id,
//                 Company_Code,
//                 Company_Name,
//                 Company_Address,
//                 State,
//                 Country
//             FROM tbl_Company_Master 
//             WHERE Del_Flag = 0
//             ORDER BY Company_Name ASC
//         `;

//         const rows = await sequelize.query(query, {
//             type: 'SELECT'
//         }) as any[];

//         res.status(200).json({
//             success: true,
//             data: rows,
//             database: dbName
//         });

//     } catch (e) {
//         console.error('Error fetching active companies:', e);
//         servError(e, res);
//     }
// };

// // Create company
// export const createCompany = async (req: Request, res: Response) => {
//     try {
//         const sequelize = getCurrentSequelize(req);
//         const dbName = getCurrentDatabaseName(req);

//         const normalizedBody = {
//             ...req.body,
//             Company_Code: req.body.Company_Code?.trim(),
//             Company_Name: req.body.Company_Name?.trim()
//         };

//         // Check duplicate Company_Code
//         if (normalizedBody.Company_Code) {
//             const checkDuplicateQuery = `
//                 SELECT Company_id 
//                 FROM tbl_Company_Master 
//                 WHERE UPPER(Company_Code) = UPPER(?) AND Del_Flag = 0
//             `;
            
//             const existing = await sequelize.query(checkDuplicateQuery, {
//                 replacements: [normalizedBody.Company_Code],
//                 type: 'SELECT'
//             }) as any[];

//             if (existing.length > 0) {
//                 return res.status(409).json({
//                     success: false,
//                     message: 'Company with this code already exists',
//                     field: 'Company_Code',
//                     database: dbName
//                 });
//             }
//         }

//         // Check duplicate Company_Name
//         if (normalizedBody.Company_Name) {
//             const checkDuplicateQuery = `
//                 SELECT Company_id 
//                 FROM tbl_Company_Master 
//                 WHERE UPPER(Company_Name) = UPPER(?) AND Del_Flag = 0
//             `;
            
//             const existing = await sequelize.query(checkDuplicateQuery, {
//                 replacements: [normalizedBody.Company_Name],
//                 type: 'SELECT'
//             }) as any[];

//             if (existing.length > 0) {
//                 return res.status(409).json({
//                     success: false,
//                     message: 'Company with this name already exists',
//                     field: 'Company_Name',
//                     database: dbName
//                 });
//             }
//         }

//         const preparedData = {
//             ...normalizedBody,
//             Del_Flag: 0,
//             Entry_By: (req as any).user?.id || 1,
//             Entry_Date: new Date()
//         };

//         const validation = validateWithZod<CompanyCreateInput>(
//             companyCreateSchema,
//             preparedData
//         );

//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation failed',
//                 errors: validation.errors,
//                 database: dbName
//             });
//         }

//         const validatedData = validation.data!;

//         // Get next ID
//         const maxIdQuery = `
//             SELECT MAX(Company_id) as maxId 
//             FROM tbl_Company_Master
//         `;
        
//         const maxIdResult = await sequelize.query(maxIdQuery, {
//             type: 'SELECT'
//         }) as any[];

//         const nextId = (maxIdResult[0]?.maxId || 0) + 1;

//         // Build insert query
//         const fields: string[] = ['Company_id'];
//         const placeholders: string[] = ['?'];
//         const values: any[] = [nextId];

//         Object.keys(validatedData).forEach(key => {
//             fields.push(key);
//             placeholders.push('?');
//             values.push(validatedData[key as keyof CompanyCreateInput]);
//         });

//         const insertQuery = `
//             INSERT INTO tbl_Company_Master (${fields.join(', ')})
//             VALUES (${placeholders.join(', ')})
//         `;

//         await sequelize.query(insertQuery, {
//             replacements: values
//         });

//         // Get inserted record
//         const getInsertedQuery = `
//             SELECT * FROM tbl_Company_Master 
//             WHERE Company_id = ?
//         `;

//         const insertedRecord = await sequelize.query(getInsertedQuery, {
//             replacements: [nextId],
//             type: 'SELECT'
//         }) as any[];

//         return created(res, { ...insertedRecord[0], database: dbName }, 'Company created successfully');

//     } catch (error) {
//         console.error('Error creating company:', error);
//         return servError(error, res);
//     }
// };

// // Update company
// export const updateCompany = async (req: Request, res: Response) => {
//     try {
//         const sequelize = getCurrentSequelize(req);
//         const dbName = getCurrentDatabaseName(req);

//         const idValidation = validateWithZod<{ id: number }>(companyIdSchema, req.params);
        
//         if (!idValidation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid ID parameter',
//                 errors: idValidation.errors,
//                 database: dbName
//             });
//         }

//         const { id } = idValidation.data!;

//         // Check if company exists
//         const checkExistsQuery = `
//             SELECT Company_Code, Company_Name 
//             FROM tbl_Company_Master 
//             WHERE Company_id = ? AND Del_Flag = 0
//         `;
        
//         const existingRecord = await sequelize.query(checkExistsQuery, {
//             replacements: [id],
//             type: 'SELECT'
//         }) as any[];

//         if (existingRecord.length === 0) {
//             return notFound(res, 'Company not found');
//         }

//         const currentRecord = existingRecord[0];

//         // Check duplicate Company_Code
//         if (req.body.Company_Code && req.body.Company_Code.trim() !== currentRecord.Company_Code) {
//             const checkDuplicateQuery = `
//                 SELECT Company_id 
//                 FROM tbl_Company_Master 
//                 WHERE UPPER(Company_Code) = UPPER(?) AND Del_Flag = 0 AND Company_id != ?
//             `;
            
//             const duplicate = await sequelize.query(checkDuplicateQuery, {
//                 replacements: [req.body.Company_Code.trim(), id],
//                 type: 'SELECT'
//             }) as any[];

//             if (duplicate.length > 0) {
//                 return res.status(409).json({
//                     success: false,
//                     message: 'Another company with this code already exists',
//                     field: 'Company_Code',
//                     database: dbName
//                 });
//             }
//         }

//         // Check duplicate Company_Name
//         if (req.body.Company_Name && req.body.Company_Name.trim() !== currentRecord.Company_Name) {
//             const checkDuplicateQuery = `
//                 SELECT Company_id 
//                 FROM tbl_Company_Master 
//                 WHERE UPPER(Company_Name) = UPPER(?) AND Del_Flag = 0 AND Company_id != ?
//             `;
            
//             const duplicate = await sequelize.query(checkDuplicateQuery, {
//                 replacements: [req.body.Company_Name.trim(), id],
//                 type: 'SELECT'
//             }) as any[];

//             if (duplicate.length > 0) {
//                 return res.status(409).json({
//                     success: false,
//                     message: 'Another company with this name already exists',
//                     field: 'Company_Name',
//                     database: dbName
//                 });
//             }
//         }

//         const validation = validateWithZod<CompanyUpdateInput>(companyUpdateSchema, req.body);
        
//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation failed',
//                 errors: validation.errors,
//                 database: dbName
//             });
//         }

//         const validatedBody = validation.data!;

//         // Build update query
//         const updateFields: string[] = [];
//         const updateValues: any[] = [];

//         Object.keys(validatedBody).forEach(key => {
//             if (validatedBody[key as keyof CompanyUpdateInput] !== undefined) {
//                 updateFields.push(`${key} = ?`);
//                 updateValues.push(validatedBody[key as keyof CompanyUpdateInput]);
//             }
//         });

//         // Add audit fields
//         updateFields.push('Modified_By = ?');
//         updateValues.push((req as any).user?.id || 1);
//         updateFields.push('Modified_Date = ?');
//         updateValues.push(new Date());

//         if (updateFields.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No fields to update',
//                 database: dbName
//             });
//         }

//         updateValues.push(id);

//         const updateQuery = `
//             UPDATE tbl_Company_Master 
//             SET ${updateFields.join(', ')}
//             WHERE Company_id = ? AND Del_Flag = 0
//         `;

//         await sequelize.query(updateQuery, {
//             replacements: updateValues
//         });

//         // Get updated record
//         const getUpdatedQuery = `
//             SELECT * FROM tbl_Company_Master 
//             WHERE Company_id = ?
//         `;

//         const updatedRecord = await sequelize.query(getUpdatedQuery, {
//             replacements: [id],
//             type: 'SELECT'
//         }) as any[];

//         updated(res, { ...updatedRecord[0], database: dbName }, 'Company updated successfully');

//     } catch (e) {
//         console.error('Error updating company:', e);
//         servError(e, res);
//     }
// };

// // Soft delete company
// export const deleteCompany = async (req: Request, res: Response) => {
//     try {
//         const sequelize = getCurrentSequelize(req);
//         const dbName = getCurrentDatabaseName(req);

//         const validation = validateWithZod<{ id: number }>(companyIdSchema, req.params);
        
//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid ID parameter',
//                 errors: validation.errors,
//                 database: dbName
//             });
//         }

//         const { id } = validation.data!;

//         // Check if company exists
//         const checkExistsQuery = `
//             SELECT Company_id 
//             FROM tbl_Company_Master 
//             WHERE Company_id = ? AND Del_Flag = 0
//         `;
        
//         const existingRecord = await sequelize.query(checkExistsQuery, {
//             replacements: [id],
//             type: 'SELECT'
//         }) as any[];

//         if (existingRecord.length === 0) {
//             return notFound(res, 'Company not found or already deleted');
//         }

//         // Soft delete - using GETDATE() for SQL Server
//         const deleteQuery = `
//             UPDATE tbl_Company_Master 
//             SET Del_Flag = 1, 
//                 Deleted_By = ?, 
//                 Deleted_Date = GETDATE()
//             WHERE Company_id = ?
//         `;

//         await sequelize.query(deleteQuery, {
//             replacements: [(req as any).user?.id || 1, id]
//         });

//         deleted(res, 'Company deleted successfully');

//     } catch (e) {
//         console.error('Error deleting company:', e);
//         servError(e, res);
//     }
// };

// // Restore soft-deleted company
// export const restoreCompany = async (req: Request, res: Response) => {
//     try {
//         const sequelize = getCurrentSequelize(req);
//         const dbName = getCurrentDatabaseName(req);

//         const validation = validateWithZod<{ id: number }>(companyIdSchema, req.params);
        
//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Valid ID parameter is required',
//                 errors: validation.errors,
//                 database: dbName
//             });
//         }

//         const { id } = validation.data!;

//         // Check if company exists and is deleted
//         const checkExistsQuery = `
//             SELECT Company_id 
//             FROM tbl_Company_Master 
//             WHERE Company_id = ? AND Del_Flag = 1
//         `;
        
//         const existingRecord = await sequelize.query(checkExistsQuery, {
//             replacements: [id],
//             type: 'SELECT'
//         }) as any[];

//         if (existingRecord.length === 0) {
//             return notFound(res, 'Company not found or already active');
//         }

//         // Restore company
//         const restoreQuery = `
//             UPDATE tbl_Company_Master 
//             SET Del_Flag = 0, 
//                 Modified_By = ?, 
//                 Modified_Date = GETDATE(),
//                 Deleted_By = NULL,
//                 Deleted_Date = NULL
//             WHERE Company_id = ?
//         `;

//         await sequelize.query(restoreQuery, {
//             replacements: [(req as any).user?.id || 1, id]
//         });

//         // Get restored record
//         const getRestoredQuery = `
//             SELECT * FROM tbl_Company_Master 
//             WHERE Company_id = ?
//         `;

//         const restoredRecord = await sequelize.query(getRestoredQuery, {
//             replacements: [id],
//             type: 'SELECT'
//         }) as any[];

//         res.status(200).json({
//             success: true,
//             message: 'Company restored successfully',
//             data: { ...restoredRecord[0], database: dbName }
//         });

//     } catch (error) {
//         console.error('Error restoring company:', error);
//         servError(error as Error, res);
//     }
// };

// // Hard delete company (permanent)
// export const hardDeleteCompany = async (req: Request, res: Response) => {
//     try {
//         const sequelize = getCurrentSequelize(req);
//         const dbName = getCurrentDatabaseName(req);

//         const validation = validateWithZod<{ id: number }>(companyIdSchema, req.params);
        
//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Valid ID parameter is required',
//                 errors: validation.errors,
//                 database: dbName
//             });
//         }

//         const { id } = validation.data!;

//         // Check if company exists
//         const checkExistsQuery = `
//             SELECT Company_id 
//             FROM tbl_Company_Master 
//             WHERE Company_id = ?
//         `;
        
//         const existingRecord = await sequelize.query(checkExistsQuery, {
//             replacements: [id],
//             type: 'SELECT'
//         }) as any[];

//         if (existingRecord.length === 0) {
//             return notFound(res, 'Company not found');
//         }

//         // Hard delete
//         const deleteQuery = `
//             DELETE FROM tbl_Company_Master 
//             WHERE Company_id = ?
//         `;

//         await sequelize.query(deleteQuery, {
//             replacements: [id]
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Company permanently deleted',
//             database: dbName
//         });

//     } catch (error) {
//         console.error('Error hard deleting company:', error);
//         servError(error as Error, res);
//     }
// };