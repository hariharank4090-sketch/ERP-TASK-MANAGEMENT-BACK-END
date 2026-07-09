"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorksByTaskId = exports.getWorksByEmployeeId = exports.getWorkStatistics = exports.getActiveWorks = exports.deleteWork = exports.updateWork = exports.createWork = exports.getWorkById = exports.getAllWorks = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const type_model_1 = require("../../../models/workMaster/type.model");
// ─────────────────────────────────────────────────────────────────
// STATUS MAPS
// ─────────────────────────────────────────────────────────────────
const statusMap = {
    1: 'Pending',
    2: 'In Progress',
    3: 'Completed'
};
const statusReverseMap = {
    'Pending': 1,
    'In Progress': 2,
    'Completed': 3
};
// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
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
                    message: 'Internal server error'
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
const parseParameters = (parametersJson) => {
    if (!parametersJson)
        return [];
    try {
        return JSON.parse(parametersJson);
    }
    catch {
        return [];
    }
};
const WORK_DETAIL_SELECT_BASE = `
    SELECT 
        wm.SNo, wm.Work_Id, wm.Sch_Id, wm.Task_Id, wm.Emp_Id, wm.Work_Dt,
        wm.Work_Done, wm.Start_Time, wm.End_Time, wm.Tot_Minutes, wm.Work_Status,
        wm.Entry_By, wm.Entry_Date, wm.Update_By, wm.Update_Date, wm.Process_Id,
        t.Task_Name, t.Project_Id, pm.Project_Name,
        ps.Sch_No, ps.Sch_Date, ps.Task_Type_Id, ps.Sch_Plan_Id,
        ps.Task_Sch_Timer_Based, ps.Sch_Est_Start_Time, ps.Sch_Est_End_Time,
        ps.Task_Sch_Duaration, ps.Sch_Status,
        ps.Sch_Start_Date, ps.Sch_End_Date
`;
const WORK_DETAIL_FROM_CLAUSE = `
    FROM tbl_Work_Master wm
    LEFT JOIN tbl_Task t ON wm.Task_Id = t.Task_Id
    LEFT JOIN tbl_Project_Master pm ON t.Project_Id = pm.Project_Id
    LEFT JOIN tbl_Project_Schedule ps ON wm.Sch_Id = ps.Sch_Id
`;
const WORK_DETAIL_SELECT = `
    ${WORK_DETAIL_SELECT_BASE},
    (
        SELECT wp.WNo, wp.Param_Id, tp.Paramet_Data_Type, tp.PA_Id,
               wp.Default_Value, wp.Current_Value
        FROM tbl_Work_Paramet_DT wp
        LEFT JOIN tbl_Task_Paramet_DT tp
            ON wp.Task_Id = tp.Task_Id AND wp.Param_Id = tp.Param_Id
        WHERE wp.Work_Id = wm.Work_Id
        FOR JSON PATH
    ) as parameters
    ${WORK_DETAIL_FROM_CLAUSE}
`;
const WORK_DETAIL_SELECT_NO_PARAMS = `
    ${WORK_DETAIL_SELECT_BASE}
    ${WORK_DETAIL_FROM_CLAUSE}
`;
const formatWorkRow = (row, index = 0) => ({
    SNo: row.SNo ? row.SNo.toString() : null,
    Work_Id: row.Work_Id ? row.Work_Id.toString() : null,
    Sch_Id: row.Sch_Id ? row.Sch_Id.toString() : null,
    Sch_No: row.Sch_No || null,
    Sch_Date: row.Sch_Date || null,
    Sch_Start_Date: row.Sch_Start_Date || null,
    Sch_End_Date: row.Sch_End_Date || null,
    Task_Type_Id: row.Task_Type_Id || null,
    Sch_Plan_Id: row.Sch_Plan_Id || null,
    Task_Sch_Timer_Based: row.Task_Sch_Timer_Based || null,
    Sch_Est_Start_Time: row.Sch_Est_Start_Time || null,
    Sch_Est_End_Time: row.Sch_Est_End_Time || null,
    Task_Sch_Duaration: row.Task_Sch_Duaration || null,
    Sch_Status: row.Sch_Status || null,
    Task_Id: row.Task_Id ? row.Task_Id.toString() : null,
    Task_Name: row.Task_Name || null,
    Project_Id: row.Project_Id ? row.Project_Id.toString() : null,
    Project_Name: row.Project_Name || null,
    Emp_Id: row.Emp_Id,
    Work_Dt: row.Work_Dt,
    Work_Done: row.Work_Done,
    Start_Time: row.Start_Time,
    End_Time: row.End_Time,
    Tot_Minutes: row.Tot_Minutes,
    Work_Status: statusMap[row.Work_Status || 1] || 'Pending',
    Entry_By: row.Entry_By,
    Entry_Date: row.Entry_Date,
    Update_By: row.Update_By,
    Update_Date: row.Update_Date,
    Process_Id: row.Process_Id,
    parameters: parseParameters(row.parameters)
});
// ─────────────────────────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────────────────────────
const getAllWorks = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const validation = validateWithZod(type_model_1.workMasterQuerySchema, req.query);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }
        const { search, empId, taskId, schId, fromDate, toDate, workStatus, sortBy = 'Work_Dt', sortOrder = 'DESC' } = validation.data;
        const whereConditions = [];
        const replacements = {};
        if (empId) {
            whereConditions.push(`wm.Emp_Id = :empId`);
            replacements.empId = empId;
        }
        if (taskId) {
            whereConditions.push(`wm.Task_Id = :taskId`);
            replacements.taskId = taskId;
        }
        if (schId) {
            whereConditions.push(`wm.Sch_Id = :schId`);
            replacements.schId = schId;
        }
        if (fromDate) {
            const d = new Date(fromDate);
            d.setHours(0, 0, 0, 0);
            whereConditions.push(`wm.Work_Dt >= :fromDate`);
            replacements.fromDate = d;
        }
        if (toDate) {
            const d = new Date(toDate);
            d.setHours(23, 59, 59, 999);
            whereConditions.push(`wm.Work_Dt <= :toDate`);
            replacements.toDate = d;
        }
        if (search) {
            whereConditions.push(`(wm.Work_Done LIKE :search OR CAST(wm.Work_Status AS VARCHAR) LIKE :search)`);
            replacements.search = `%${search}%`;
        }
        if (workStatus) {
            const sv = statusReverseMap[workStatus];
            if (sv) {
                whereConditions.push(`wm.Work_Status = :workStatus`);
                replacements.workStatus = sv;
            }
        }
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const query = `${WORK_DETAIL_SELECT_NO_PARAMS} ${whereClause} ORDER BY wm.${sortBy} ${sortOrder}`;
        const rows = await sequelizeInstance.query(query, { replacements, type: sequelize_1.QueryTypes.SELECT });
        // Fetch all parameters in fast bulk chunks to avoid implicit conversion and parameter limits
        if (rows.length > 0) {
            // Explicitly cast to Number so SQL Server uses the INT index instead of scanning (NVARCHAR conversion)
            const allWorkIds = rows.map(r => Number(r.Work_Id)).filter(id => !isNaN(id));
            const paramsMap = new Map();
            // Process in chunks of 500 to avoid SQL Server limits
            const chunkSize = 500;
            for (let i = 0; i < allWorkIds.length; i += chunkSize) {
                const chunkIds = allWorkIds.slice(i, i + chunkSize);
                if (chunkIds.length === 0)
                    continue;
                const params = await sequelizeInstance.query(`
                    SELECT wp.Work_Id, wp.WNo, wp.Param_Id, tp.Paramet_Data_Type, tp.PA_Id,
                           wp.Default_Value, wp.Current_Value
                    FROM tbl_Work_Paramet_DT wp
                    LEFT JOIN tbl_Task_Paramet_DT tp
                        ON wp.Task_Id = tp.Task_Id AND wp.Param_Id = tp.Param_Id
                    WHERE wp.Work_Id IN (:chunkIds)
                `, { replacements: { chunkIds }, type: sequelize_1.QueryTypes.SELECT });
                params.forEach(p => {
                    const key = String(p.Work_Id);
                    if (!paramsMap.has(key))
                        paramsMap.set(key, []);
                    paramsMap.get(key).push(p);
                });
            }
            rows.forEach(r => {
                const key = String(r.Work_Id);
                r.parameters = JSON.stringify(paramsMap.get(key) || []);
            });
        }
        return res.status(200).json({ success: true, message: 'Works retrieved successfully', data: rows.map(formatWorkRow) });
    }
    catch (e) {
        console.error('Get All Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getAllWorks = getAllWorks;
// ─────────────────────────────────────────────────────────────────
// GET BY ID (SNo)
// ─────────────────────────────────────────────────────────────────
const getWorkById = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const validation = validateWithZod(type_model_1.workMasterIdSchema, req.params);
        if (!validation.success)
            return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
        const { id } = validation.data;
        const result = await sequelizeInstance.query(`${WORK_DETAIL_SELECT} WHERE wm.SNo = :id`, { replacements: { id }, type: sequelize_1.QueryTypes.SELECT });
        if (!result.length)
            return res.status(404).json({ success: false, message: 'Work not found' });
        return res.status(200).json({ success: true, message: 'Work retrieved successfully', data: formatWorkRow(result[0], 0) });
    }
    catch (e) {
        console.error('Get By ID Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getWorkById = getWorkById;
// ─────────────────────────────────────────────────────────────────
// CREATE — Upsert logic: Check for existing record with same Sch_Id, Task_Id, Emp_Id, Work_Dt
// If exists, update it; otherwise create new with auto-generated Work_Id
// ─────────────────────────────────────────────────────────────────
const getNextWorkId = async (sequelizeInstance, transaction) => {
    const result = await sequelizeInstance.query(`SELECT ISNULL(MAX(Work_Id), 0) + 1 as NextWorkId FROM tbl_Work_Master`, { type: sequelize_1.QueryTypes.SELECT, transaction });
    return result[0].NextWorkId;
};
const checkExistingWork = async (sequelizeInstance, schId, taskId, empId, workDt, transaction) => {
    const toSqlDateTime = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ` +
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.000`;
    const startOfDay = toSqlDateTime(workDt);
    const nextDay = new Date(workDt);
    nextDay.setDate(nextDay.getDate() + 1);
    const endOfDay = toSqlDateTime(nextDay);
    const result = await sequelizeInstance.query(`SELECT SNo, Work_Id FROM tbl_Work_Master 
         WHERE Sch_Id = :schId 
           AND Task_Id = :taskId 
           AND Emp_Id = :empId 
           AND Work_Dt >= :startOfDay
           AND Work_Dt < :endOfDay`, {
        replacements: { schId, taskId, empId, startOfDay, endOfDay },
        type: sequelize_1.QueryTypes.SELECT,
        transaction
    });
    return result.length ? result[0] : null;
};
const updateExistingWork = async (sequelizeInstance, sno, workId, data, transaction) => {
    const setClauses = [];
    const replacements = { sno };
    if (data.Work_Done !== undefined) {
        setClauses.push('Work_Done = :workDone');
        replacements.workDone = data.Work_Done;
    }
    if (data.Start_Time !== undefined) {
        setClauses.push('Start_Time = :startTime');
        replacements.startTime = data.Start_Time;
    }
    if (data.End_Time !== undefined) {
        setClauses.push('End_Time = :endTime');
        replacements.endTime = data.End_Time;
    }
    if (data.Tot_Minutes !== undefined) {
        setClauses.push('Tot_Minutes = :totMinutes');
        replacements.totMinutes = data.Tot_Minutes;
    }
    if (data.Work_Status !== undefined) {
        setClauses.push('Work_Status = :workStatus');
        replacements.workStatus = data.Work_Status;
    }
    if (data.Process_Id !== undefined) {
        setClauses.push('Process_Id = :processId');
        replacements.processId = data.Process_Id;
    }
    setClauses.push('Update_Date = GETDATE()');
    if (setClauses.length > 1) {
        await sequelizeInstance.query(`UPDATE tbl_Work_Master SET ${setClauses.join(', ')} WHERE SNo = :sno`, { replacements, transaction });
    }
    // Update parameters if provided
    if (data.Parameters && data.Parameters.length > 0) {
        // Delete existing parameters
        await sequelizeInstance.query(`DELETE FROM tbl_Work_Paramet_DT WHERE Work_Id = :workId`, { replacements: { workId }, transaction });
        // Insert new parameters
        for (const param of data.Parameters) {
            await sequelizeInstance.query(`
                INSERT INTO tbl_Work_Paramet_DT (Work_Id, Task_Id, Param_Id, Default_Value, Current_Value)
                VALUES (:workId, :taskId, :paramId, :defaultValue, :currentValue)
            `, {
                replacements: {
                    workId: workId,
                    taskId: data.Task_Id,
                    paramId: param.Param_Id,
                    defaultValue: param.Default_Value || null,
                    currentValue: param.Current_Value || null
                },
                transaction
            });
        }
    }
};
const insertNewWork = async (sequelizeInstance, data, nextWorkId, workDate, transaction) => {
    await sequelizeInstance.query(`
        INSERT INTO tbl_Work_Master (
            Work_Id, Sch_Id, Task_Id, Emp_Id, Work_Dt, Work_Done,
            Start_Time, End_Time, Tot_Minutes, Work_Status,
            Entry_By, Entry_Date, Process_Id
        ) VALUES (
            :workId, :schId, :taskId, :empId, :workDt, :workDone,
            :startTime, :endTime, :totMinutes, :workStatus,
            :entryBy, GETDATE(), :processId
        )
    `, {
        replacements: {
            workId: nextWorkId,
            schId: data.Sch_Id,
            taskId: data.Task_Id,
            empId: data.Emp_Id,
            workDt: workDate,
            workDone: data.Work_Done || null,
            startTime: data.Start_Time || null,
            endTime: data.End_Time || null,
            totMinutes: data.Tot_Minutes || null,
            workStatus: data.Work_Status || 1,
            entryBy: data.Entry_By || null,
            processId: data.Process_Id || null
        },
        transaction
    });
    // Insert parameters
    if (data.Parameters && data.Parameters.length > 0) {
        for (const param of data.Parameters) {
            await sequelizeInstance.query(`
                INSERT INTO tbl_Work_Paramet_DT (Work_Id, Task_Id, Param_Id, Default_Value, Current_Value)
                VALUES (:workId, :taskId, :paramId, :defaultValue, :currentValue)
            `, {
                replacements: {
                    workId: nextWorkId,
                    taskId: data.Task_Id,
                    paramId: param.Param_Id,
                    defaultValue: param.Default_Value || null,
                    currentValue: param.Current_Value || null
                },
                transaction
            });
        }
    }
    // Get the SNo of the newly inserted record
    const newRowResult = await sequelizeInstance.query(`SELECT SNo FROM tbl_Work_Master WHERE Work_Id = :workId`, { replacements: { workId: nextWorkId }, type: sequelize_1.QueryTypes.SELECT, transaction });
    return newRowResult.length ? newRowResult[0].SNo : 0;
};
const createWork = async (req, res) => {
    const sequelizeInstance = getSequelizeFromRequest(req);
    const transaction = await sequelizeInstance.transaction();
    const safeRollback = async () => {
        if (!transaction.finished) {
            try {
                await transaction.rollback();
            }
            catch (rollbackErr) {
                console.error('Rollback failed:', rollbackErr);
            }
        }
    };
    try {
        const validation = validateWithZod(type_model_1.workMasterCreateSchema, req.body);
        if (!validation.success) {
            await transaction.rollback().catch(() => { });
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }
        const data = validation.data;
        const workDate = new Date(data.Work_Dt);
        workDate.setHours(0, 0, 0, 0);
        const taskResult = await sequelizeInstance.query(`SELECT Task_Id FROM tbl_Task WHERE Task_Id = :taskId`, { replacements: { taskId: String(data.Task_Id) }, type: sequelize_1.QueryTypes.SELECT, transaction });
        if (!taskResult.length) {
            await transaction.rollback().catch(() => { });
            return res.status(400).json({ success: false, message: 'Invalid Task_Id. Task does not exist.' });
        }
        const scheduleResult = await sequelizeInstance.query(`SELECT Sch_Id FROM tbl_Project_Schedule WHERE Sch_Id = :schId`, { replacements: { schId: data.Sch_Id }, type: sequelize_1.QueryTypes.SELECT, transaction });
        if (!scheduleResult.length) {
            await transaction.rollback().catch(() => { });
            return res.status(400).json({ success: false, message: 'Invalid Sch_Id. Schedule does not exist.' });
        }
        const existingWork = await checkExistingWork(sequelizeInstance, data.Sch_Id, data.Task_Id, data.Emp_Id, workDate, transaction);
        let sno;
        let isUpdate = false;
        if (existingWork) {
            await updateExistingWork(sequelizeInstance, existingWork.SNo, existingWork.Work_Id, data, transaction);
            sno = existingWork.SNo;
            isUpdate = true;
        }
        else {
            const nextWorkId = await getNextWorkId(sequelizeInstance, transaction);
            sno = await insertNewWork(sequelizeInstance, data, nextWorkId, workDate, transaction);
        }
        await transaction.commit();
        const result = await sequelizeInstance.query(`${WORK_DETAIL_SELECT} WHERE wm.SNo = :sno`, { replacements: { sno }, type: sequelize_1.QueryTypes.SELECT });
        const message = isUpdate ? 'Work updated successfully' : 'Work created successfully';
        const statusCode = isUpdate ? 200 : 201;
        return res.status(statusCode).json({
            success: true,
            message,
            data: result.length ? formatWorkRow(result[0], 0) : null
        });
    }
    catch (e) {
        await transaction.rollback().catch(() => { });
        console.error('Create/Update Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error', error: e });
    }
};
exports.createWork = createWork;
// ─────────────────────────────────────────────────────────────────
// UPDATE (by SNo) - Regular update by primary key
// ─────────────────────────────────────────────────────────────────
const updateWork = async (req, res) => {
    const sequelizeInstance = getSequelizeFromRequest(req);
    const transaction = await sequelizeInstance.transaction();
    try {
        const idValidation = validateWithZod(type_model_1.workMasterIdSchema, req.params);
        if (!idValidation.success) {
            await transaction.rollback().catch(() => { });
            return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
        }
        const { id } = idValidation.data;
        const existing = await sequelizeInstance.query(`SELECT * FROM tbl_Work_Master WHERE SNo = :id`, { replacements: { id }, type: sequelize_1.QueryTypes.SELECT, transaction });
        if (!existing.length) {
            await transaction.rollback().catch(() => { });
            return res.status(404).json({ success: false, message: 'Work not found' });
        }
        const existingWork = existing[0];
        const bodyValidation = validateWithZod(type_model_1.workMasterUpdateSchema, req.body);
        if (!bodyValidation.success) {
            await transaction.rollback().catch(() => { });
            return res.status(400).json({ success: false, message: 'Validation failed', errors: bodyValidation.errors });
        }
        const data = bodyValidation.data;
        const setClauses = [];
        const replacements = { id };
        if (data.Sch_Id !== undefined) {
            const sr = await sequelizeInstance.query(`SELECT Sch_Id FROM tbl_Project_Schedule WHERE Sch_Id = :schId`, { replacements: { schId: data.Sch_Id }, type: sequelize_1.QueryTypes.SELECT, transaction });
            if (!sr.length) {
                await transaction.rollback().catch(() => { });
                return res.status(400).json({ success: false, message: 'Invalid Sch_Id. Schedule does not exist.' });
            }
            setClauses.push('Sch_Id = :schId');
            replacements.schId = data.Sch_Id;
        }
        if (data.Task_Id !== undefined) {
            const taskCheck = await sequelizeInstance.query(`SELECT Task_Id FROM tbl_Task WHERE Task_Id = :taskId`, { replacements: { taskId: data.Task_Id }, type: sequelize_1.QueryTypes.SELECT, transaction });
            if (!taskCheck.length) {
                await transaction.rollback().catch(() => { });
                return res.status(400).json({ success: false, message: 'Invalid Task_Id. Task does not exist.' });
            }
            setClauses.push('Task_Id = :taskId');
            replacements.taskId = data.Task_Id;
        }
        if (data.Emp_Id !== undefined) {
            setClauses.push('Emp_Id = :empId');
            replacements.empId = data.Emp_Id;
        }
        if (data.Work_Dt !== undefined) {
            setClauses.push('Work_Dt = :workDt');
            replacements.workDt = new Date(data.Work_Dt);
        }
        if (data.Work_Done !== undefined) {
            setClauses.push('Work_Done = :workDone');
            replacements.workDone = data.Work_Done;
        }
        if (data.Start_Time !== undefined) {
            setClauses.push('Start_Time = :startTime');
            replacements.startTime = data.Start_Time;
        }
        if (data.End_Time !== undefined) {
            setClauses.push('End_Time = :endTime');
            replacements.endTime = data.End_Time;
        }
        if (data.Tot_Minutes !== undefined) {
            setClauses.push('Tot_Minutes = :totMinutes');
            replacements.totMinutes = data.Tot_Minutes;
        }
        if (data.Work_Status !== undefined) {
            setClauses.push('Work_Status = :workStatus');
            replacements.workStatus = data.Work_Status;
        }
        if (data.Update_By !== undefined) {
            setClauses.push('Update_By = :updateBy');
            replacements.updateBy = data.Update_By;
        }
        if (data.Process_Id !== undefined) {
            setClauses.push('Process_Id = :processId');
            replacements.processId = data.Process_Id;
        }
        setClauses.push('Update_Date = GETDATE()');
        if (setClauses.length > 1) {
            await sequelizeInstance.query(`UPDATE tbl_Work_Master SET ${setClauses.join(', ')} WHERE SNo = :id`, { replacements, transaction });
        }
        if (data.Parameters !== undefined) {
            await sequelizeInstance.query(`DELETE FROM tbl_Work_Paramet_DT WHERE Work_Id = :workId`, { replacements: { workId: existingWork.Work_Id }, transaction });
            for (const param of data.Parameters) {
                await sequelizeInstance.query(`
                    INSERT INTO tbl_Work_Paramet_DT (Work_Id, Task_Id, Param_Id, Default_Value, Current_Value)
                    VALUES (:workId, :taskId, :paramId, :defaultValue, :currentValue)
                `, {
                    replacements: {
                        workId: existingWork.Work_Id,
                        taskId: data.Task_Id || existingWork.Task_Id,
                        paramId: param.Param_Id,
                        defaultValue: param.Default_Value || null,
                        currentValue: param.Current_Value || null
                    },
                    transaction
                });
            }
        }
        await transaction.commit();
        const result = await sequelizeInstance.query(`${WORK_DETAIL_SELECT} WHERE wm.SNo = :id`, { replacements: { id }, type: sequelize_1.QueryTypes.SELECT });
        return res.status(200).json({ success: true, message: 'Work updated successfully', data: formatWorkRow(result[0], 0) });
    }
    catch (e) {
        await transaction.rollback().catch(() => { });
        console.error('Update Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error', error: e });
    }
};
exports.updateWork = updateWork;
// ─────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────
const deleteWork = async (req, res) => {
    const sequelizeInstance = getSequelizeFromRequest(req);
    const transaction = await sequelizeInstance.transaction();
    try {
        const validation = validateWithZod(type_model_1.workMasterIdSchema, req.params);
        if (!validation.success) {
            await transaction.rollback().catch(() => { });
            return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
        }
        const { id } = validation.data;
        const existing = await sequelizeInstance.query(`SELECT Work_Id FROM tbl_Work_Master WHERE SNo = :id`, { replacements: { id }, type: sequelize_1.QueryTypes.SELECT, transaction });
        if (!existing.length) {
            await transaction.rollback().catch(() => { });
            return res.status(404).json({ success: false, message: 'Work not found' });
        }
        await sequelizeInstance.query(`DELETE FROM tbl_Work_Paramet_DT WHERE Work_Id = :workId`, {
            replacements: { workId: existing[0].Work_Id }, transaction
        });
        await sequelizeInstance.query(`DELETE FROM tbl_Work_Master WHERE SNo = :id`, {
            replacements: { id }, transaction
        });
        await transaction.commit();
        return res.status(200).json({ success: true, message: 'Work deleted successfully' });
    }
    catch (e) {
        await transaction.rollback().catch(() => { });
        console.error('Delete Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error', error: e });
    }
};
exports.deleteWork = deleteWork;
// ─────────────────────────────────────────────────────────────────
// ACTIVE WORKS
// ─────────────────────────────────────────────────────────────────
const getActiveWorks = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const { empId } = req.query;
        const whereConditions = [];
        const replacements = {};
        if (empId && !isNaN(Number(empId))) {
            whereConditions.push(`wm.Emp_Id = :empId`);
            replacements.empId = Number(empId);
        }
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const query = `${WORK_DETAIL_SELECT} ${whereClause} ORDER BY wm.Work_Dt DESC`;
        const rows = await sequelizeInstance.query(query, { replacements, type: sequelize_1.QueryTypes.SELECT });
        return res.status(200).json({ success: true, message: 'Active works retrieved successfully', data: rows.map(formatWorkRow) });
    }
    catch (e) {
        console.error('Get Active Works Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getActiveWorks = getActiveWorks;
// ─────────────────────────────────────────────────────────────────
// STATISTICS
// ─────────────────────────────────────────────────────────────────
const getWorkStatistics = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const empId = req.query.empId ? parseInt(req.query.empId) : undefined;
        const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : undefined;
        const toDate = req.query.toDate ? new Date(req.query.toDate) : undefined;
        const whereConditions = [];
        const replacements = {};
        if (empId) {
            whereConditions.push(`Emp_Id = :empId`);
            replacements.empId = empId;
        }
        if (fromDate) {
            whereConditions.push(`Work_Dt >= :fromDate`);
            replacements.fromDate = fromDate;
        }
        if (toDate) {
            whereConditions.push(`Work_Dt <= :toDate`);
            replacements.toDate = toDate;
        }
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const stats = await sequelizeInstance.query(`SELECT Work_Status, COUNT(SNo) as count, SUM(Tot_Minutes) as totalMinutes
             FROM tbl_Work_Master ${whereClause}
             GROUP BY Work_Status`, { replacements, type: sequelize_1.QueryTypes.SELECT });
        return res.status(200).json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: stats.map(s => ({ ...s, Work_Status: statusMap[s.Work_Status] || 'Unknown' }))
        });
    }
    catch (e) {
        console.error('Statistics Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getWorkStatistics = getWorkStatistics;
// ─────────────────────────────────────────────────────────────────
// BY EMPLOYEE ID
// ─────────────────────────────────────────────────────────────────
const getWorksByEmployeeId = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const { empId } = req.params;
        if (!empId || isNaN(Number(empId)))
            return res.status(400).json({ success: false, message: 'Valid Employee ID is required' });
        const rows = await sequelizeInstance.query(`${WORK_DETAIL_SELECT} WHERE wm.Emp_Id = :empId ORDER BY wm.Work_Dt DESC`, { replacements: { empId: Number(empId) }, type: sequelize_1.QueryTypes.SELECT });
        return res.status(200).json({ success: true, message: 'Works retrieved successfully', data: rows.map(formatWorkRow) });
    }
    catch (e) {
        console.error('Get By Employee Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getWorksByEmployeeId = getWorksByEmployeeId;
// ─────────────────────────────────────────────────────────────────
// BY TASK ID
// ─────────────────────────────────────────────────────────────────
const getWorksByTaskId = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const { taskId } = req.params;
        if (!taskId || isNaN(Number(taskId)))
            return res.status(400).json({ success: false, message: 'Valid Task ID is required' });
        const rows = await sequelizeInstance.query(`${WORK_DETAIL_SELECT} WHERE wm.Task_Id = :taskId ORDER BY wm.Work_Dt DESC`, { replacements: { taskId: Number(taskId) }, type: sequelize_1.QueryTypes.SELECT });
        return res.status(200).json({ success: true, message: 'Works retrieved successfully', data: rows.map(formatWorkRow) });
    }
    catch (e) {
        console.error('Get By Task Error:', e);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getWorksByTaskId = getWorksByTaskId;
