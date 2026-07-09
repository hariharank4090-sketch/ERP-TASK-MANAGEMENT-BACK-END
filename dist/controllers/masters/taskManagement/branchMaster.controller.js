"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = exports.updateBranch = exports.createBranch = exports.getBranchById = exports.getAllBranches = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const type_model_1 = require("../../../models/masters/branchMaster/type.model");
const validateWithZod = (schema, data) => {
    try {
        return { success: true, data: schema.parse(data) };
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return {
                success: false,
                errors: err.issues.map(e => ({
                    field: e.path.join('.') || 'unknown',
                    message: 'Validation error: ' + e.message
                }))
            };
        }
        return { success: false, errors: [{ field: 'unknown', message: 'Validation failed' }] };
    }
};
const getSequelizeFromRequest = (req) => {
    if (req.companyDB)
        return req.companyDB;
    const { getDefaultConnection } = require('../../../config/sequalizer');
    return getDefaultConnection();
};
const getAllBranches = async (req, res) => {
    try {
        const sequelize = getSequelizeFromRequest(req);
        const validation = validateWithZod(type_model_1.branchQuerySchema, req.query);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }
        const { search, sortBy = 'BranchId', sortOrder = 'DESC', page = 1, limit = 20 } = validation.data;
        const whereConditions = ['Del_Flag = 0'];
        const replacements = {};
        if (search) {
            whereConditions.push(`(BranchCode LIKE :search OR BranchName LIKE :search)`);
            replacements.search = `%${search}%`;
        }
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;
        const countQuery = `SELECT COUNT(*) as total FROM tbl_Branch_Master ${whereClause}`;
        const countResult = await sequelize.query(countQuery, { replacements, type: sequelize_1.QueryTypes.SELECT });
        const totalRecords = countResult[0]?.total || 0;
        const dataQuery = `
            SELECT * FROM tbl_Branch_Master
            ${whereClause}
            ORDER BY ${sortBy} ${sortOrder}
            OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
        `;
        replacements.offset = offset;
        replacements.limit = limit;
        const rows = await sequelize.query(dataQuery, { replacements, type: sequelize_1.QueryTypes.SELECT });
        return res.status(200).json({
            success: true,
            message: 'Branches retrieved successfully',
            data: rows,
            pagination: {
                page,
                limit,
                total: totalRecords,
                totalPages: Math.ceil(totalRecords / limit)
            }
        });
    }
    catch (e) {
        console.error('Get All Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getAllBranches = getAllBranches;
const getBranchById = async (req, res) => {
    try {
        const sequelize = getSequelizeFromRequest(req);
        const validation = validateWithZod(type_model_1.branchIdSchema, req.params);
        if (!validation.success)
            return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
        const { id } = validation.data;
        const result = await sequelize.query(`SELECT * FROM tbl_Branch_Master WHERE BranchId = :id AND Del_Flag = 0`, { replacements: { id }, type: sequelize_1.QueryTypes.SELECT });
        if (!result.length)
            return res.status(404).json({ success: false, message: 'Branch not found' });
        return res.status(200).json({ success: true, message: 'Branch retrieved successfully', data: result[0] });
    }
    catch (e) {
        console.error('Get By ID Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getBranchById = getBranchById;
const createBranch = async (req, res) => {
    const sequelize = getSequelizeFromRequest(req);
    const transaction = await sequelize.transaction();
    try {
        const validation = validateWithZod(type_model_1.branchCreateSchema, req.body);
        if (!validation.success) {
            await transaction.rollback().catch(() => { });
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }
        const data = validation.data;
        const nextIdResult = await sequelize.query(`SELECT ISNULL(MAX(BranchId), 0) + 1 as nextId FROM tbl_Branch_Master`, { type: sequelize_1.QueryTypes.SELECT, transaction });
        const branchId = nextIdResult[0].nextId;
        const fields = ['BranchId'];
        const values = [':BranchId'];
        const replacements = { BranchId: branchId };
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(key);
                values.push(`:${key}`);
                replacements[key] = value;
            }
        }
        fields.push('Entry_Date');
        values.push('GETDATE()');
        const insertQuery = `INSERT INTO tbl_Branch_Master (${fields.join(', ')}) VALUES (${values.join(', ')})`;
        await sequelize.query(insertQuery, { replacements, transaction });
        await transaction.commit();
        const result = await sequelize.query(`SELECT * FROM tbl_Branch_Master WHERE BranchId = :BranchId`, { replacements, type: sequelize_1.QueryTypes.SELECT });
        return res.status(201).json({ success: true, message: 'Branch created successfully', data: result[0] });
    }
    catch (e) {
        await transaction.rollback().catch(() => { });
        console.error('Create Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error', error: e });
    }
};
exports.createBranch = createBranch;
const updateBranch = async (req, res) => {
    const sequelize = getSequelizeFromRequest(req);
    const transaction = await sequelize.transaction();
    try {
        const idValidation = validateWithZod(type_model_1.branchIdSchema, req.params);
        if (!idValidation.success) {
            await transaction.rollback().catch(() => { });
            return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
        }
        const { id } = idValidation.data;
        const existing = await sequelize.query(`SELECT BranchId FROM tbl_Branch_Master WHERE BranchId = :id AND Del_Flag = 0`, { replacements: { id }, type: sequelize_1.QueryTypes.SELECT, transaction });
        if (!existing.length) {
            await transaction.rollback().catch(() => { });
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        const bodyValidation = validateWithZod(type_model_1.branchUpdateSchema, req.body);
        if (!bodyValidation.success) {
            await transaction.rollback().catch(() => { });
            return res.status(400).json({ success: false, message: 'Validation failed', errors: bodyValidation.errors });
        }
        const data = bodyValidation.data;
        const setClauses = [];
        const replacements = { id };
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                setClauses.push(`${key} = :${key}`);
                replacements[key] = value;
            }
        }
        if (setClauses.length > 0) {
            setClauses.push('Modified_Date = GETDATE()');
            const updateQuery = `UPDATE tbl_Branch_Master SET ${setClauses.join(', ')} WHERE BranchId = :id`;
            await sequelize.query(updateQuery, { replacements, transaction });
        }
        await transaction.commit();
        const result = await sequelize.query(`SELECT * FROM tbl_Branch_Master WHERE BranchId = :id`, { replacements: { id }, type: sequelize_1.QueryTypes.SELECT });
        return res.status(200).json({ success: true, message: 'Branch updated successfully', data: result[0] });
    }
    catch (e) {
        await transaction.rollback().catch(() => { });
        console.error('Update Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error', error: e });
    }
};
exports.updateBranch = updateBranch;
const deleteBranch = async (req, res) => {
    const sequelize = getSequelizeFromRequest(req);
    const transaction = await sequelize.transaction();
    try {
        const idValidation = validateWithZod(type_model_1.branchIdSchema, req.params);
        if (!idValidation.success) {
            await transaction.rollback().catch(() => { });
            return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
        }
        const { id } = idValidation.data;
        const existing = await sequelize.query(`SELECT BranchId FROM tbl_Branch_Master WHERE BranchId = :id AND Del_Flag = 0`, { replacements: { id }, type: sequelize_1.QueryTypes.SELECT, transaction });
        if (!existing.length) {
            await transaction.rollback().catch(() => { });
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        await sequelize.query(`UPDATE tbl_Branch_Master SET Del_Flag = 1, Deleted_Date = GETDATE() WHERE BranchId = :id`, { replacements: { id }, transaction });
        await transaction.commit();
        return res.status(200).json({ success: true, message: 'Branch deleted successfully' });
    }
    catch (e) {
        await transaction.rollback().catch(() => { });
        console.error('Delete Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error', error: e });
    }
};
exports.deleteBranch = deleteBranch;
