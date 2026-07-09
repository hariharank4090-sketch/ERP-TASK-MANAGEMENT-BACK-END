import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import { ZodError } from 'zod';

import {
    workParameterCreateSchema,
    workParameterUpdateSchema,
    workParameterIdSchema,
    workParameterQuerySchema,
    WorkParameterCreateInput,
    WorkParameterUpdateInput,
    WorkParameterQueryParams,
    WorkParameterAttributes,
    initializeWorkParameterModel,
    WorkParameter
} from '../../../models/workParamter/type.model';

import { initializeWorkMasterModel } from '../../../models/workMaster/type.model';

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
                    message: 'Internal server error'
                }))
            };
        }
        return { success: false, errors: [{ field: 'unknown', message: 'Validation failed' }] };
    }
};

/* ================= HELPER: Get Sequelize Instance from Request ================= */
const getSequelizeFromRequest = (req: Request): Sequelize => {
    if (req.companyDB) {
        console.log(`✅ Using companyDB: ${(req.companyDB as any).config?.database || 'unknown'}`);
        return req.companyDB;
    }
    
    console.log(`⚠️ No companyDB, using default connection`);
    const { getDefaultConnection } = require('../../../config/sequalizer');
    return getDefaultConnection();
};

/* ================= GET ALL WORK PARAMETERS ================= */
export const getAllWorkParameters = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const WorkParameterModel = initializeWorkParameterModel(sequelizeInstance);
        const WorkMasterModel = initializeWorkMasterModel(sequelizeInstance);
        
        const validation = validateWithZod<WorkParameterQueryParams>(
            workParameterQuerySchema,
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
            limit = 10, 
            search, 
            workId, 
            taskId, 
            paramId,
            sortBy = 'Work_Id',
            sortOrder = 'ASC'
        } = validation.data!;

        const where: any = {};

        if (workId) {
            where.Work_Id = workId;
        }

        if (taskId) {
            where.Task_Id = taskId;
        }

        if (paramId) {
            where.Param_Id = paramId;
        }

        if (search && search.trim()) {
            where[Op.or] = [
                { Default_Value: { [Op.like]: `%${search}%` } },
                { Current_Value: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { rows, count } = await WorkParameterModel.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, sortOrder]],
            include: [{
                model: WorkMasterModel,
                as: 'workMaster',
                attributes: ['Work_Id', 'Work_Dt', 'Work_Status'],
                required: false
            }]
        });

        const totalPages = Math.ceil(count / limit);

        return res.status(200).json({
            success: true,
            message: 'Work parameters retrieved successfully',
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

/* ================= GET WORK PARAMETER BY ID ================= */
export const getWorkParameterById = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const WorkParameterModel = initializeWorkParameterModel(sequelizeInstance);
        const WorkMasterModel = initializeWorkMasterModel(sequelizeInstance);
        
        const validation = validateWithZod<{ id: number }>(
            workParameterIdSchema,
            req.params
        );

        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid ID parameter' 
            });
        }

        const { id } = validation.data!;

        const workParameter = await WorkParameterModel.findOne({
            where: { WNo: id },
            include: [{
                model: WorkMasterModel,
                as: 'workMaster',
                required: false,
                attributes: ['Work_Id', 'Work_Dt', 'Work_Status']
            }]
        });

        if (!workParameter) {
            return res.status(404).json({
                success: false,
                message: 'Work parameter not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Work parameter retrieved successfully',
            data: workParameter
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

/* ================= CREATE WORK PARAMETER ================= */
export const createWorkParameter = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const WorkParameterModel = initializeWorkParameterModel(sequelizeInstance);
        const WorkMasterModel = initializeWorkMasterModel(sequelizeInstance);
        
        console.log(`📊 Creating work parameter in database: ${(sequelizeInstance as any).config?.database || 'unknown'}`);
        console.log(`📊 Company ID: ${req.currentCompanyId}, DB Name: ${req.currentDBName}`);
        
        const validation = validateWithZod<WorkParameterCreateInput>(
            workParameterCreateSchema,
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: validation.errors 
            });
        }

        const data = validation.data!;

        // Check if Work_Id exists in WorkMaster
        const workExists = await WorkMasterModel.findOne({
            where: { Work_Id: data.Work_Id }
        });

        if (!workExists) {
            return res.status(400).json({
                success: false,
                message: 'Work ID does not exist in Work Master',
                field: 'Work_Id'
            });
        }

        // Check for duplicate (Work_Id + Param_Id combination)
        const existing = await WorkParameterModel.findOne({
            where: {
                Work_Id: data.Work_Id,
                Param_Id: data.Param_Id
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Parameter already exists for this work',
                field: 'Param_Id'
            });
        }

        const workParameter = await WorkParameterModel.create(data);

        // Fetch with association
        const result = await WorkParameterModel.findOne({
            where: { WNo: workParameter.WNo },
            include: [{
                model: WorkMasterModel,
                as: 'workMaster',
                required: false,
                attributes: ['Work_Id', 'Work_Dt', 'Work_Status']
            }]
        });

        return res.status(201).json({
            success: true,
            message: 'Work parameter created successfully',
            data: result
        });

    } catch (e: any) {
        console.error('Create Error:', e);
        
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'Duplicate entry: Work_Id and Param_Id combination already exists'
            });
        }
        
        if (e.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Foreign key constraint failed: Invalid Work_Id, Task_Id, or Param_Id'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= UPDATE WORK PARAMETER ================= */
export const updateWorkParameter = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const WorkParameterModel = initializeWorkParameterModel(sequelizeInstance);
        const WorkMasterModel = initializeWorkMasterModel(sequelizeInstance);
        
        const idValidation = validateWithZod<{ id: number }>(workParameterIdSchema, req.params);
        if (!idValidation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid ID parameter' 
            });
        }

        const { id } = idValidation.data!;

        const workParameter = await WorkParameterModel.findOne({
            where: { WNo: id }
        });

        if (!workParameter) {
            return res.status(404).json({
                success: false,
                message: 'Work parameter not found'
            });
        }

        const bodyValidation = validateWithZod<WorkParameterUpdateInput>(
            workParameterUpdateSchema,
            req.body
        );

        if (!bodyValidation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: bodyValidation.errors 
            });
        }

        const data = bodyValidation.data!;

        // If updating Work_Id, check if it exists in WorkMaster
        if (data.Work_Id && data.Work_Id !== workParameter.Work_Id) {
            const workExists = await WorkMasterModel.findOne({
                where: { Work_Id: data.Work_Id }
            });

            if (!workExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Work ID does not exist in Work Master',
                    field: 'Work_Id'
                });
            }
        }

        // Check for duplicate if changing Work_Id or Param_Id
        if ((data.Work_Id && data.Work_Id !== workParameter.Work_Id) || 
            (data.Param_Id && data.Param_Id !== workParameter.Param_Id)) {
            
            const duplicate = await WorkParameterModel.findOne({
                where: {
                    Work_Id: data.Work_Id || workParameter.Work_Id,
                    Param_Id: data.Param_Id || workParameter.Param_Id,
                    WNo: { [Op.ne]: id }
                }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: 'Parameter already exists for this work',
                    field: 'Param_Id'
                });
            }
        }

        await workParameter.update(data);

        // Fetch updated data with association
        const result = await WorkParameterModel.findOne({
            where: { WNo: id },
            include: [{
                model: WorkMasterModel,
                as: 'workMaster',
                required: false,
                attributes: ['Work_Id', 'Work_Dt', 'Work_Status']
            }]
        });

        return res.status(200).json({
            success: true,
            message: 'Work parameter updated successfully',
            data: result
        });

    } catch (e: any) {
        console.error('Update Error:', e);
        
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'Duplicate entry: Work_Id and Param_Id combination already exists'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= DELETE WORK PARAMETER ================= */
export const deleteWorkParameter = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const WorkParameterModel = initializeWorkParameterModel(sequelizeInstance);
        
        const validation = validateWithZod<{ id: number }>(workParameterIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid ID parameter' 
            });
        }

        const { id } = validation.data!;

        const workParameter = await WorkParameterModel.findByPk(id);

        if (!workParameter) {
            return res.status(404).json({
                success: false,
                message: 'Work parameter not found'
            });
        }

        await workParameter.destroy();

        return res.status(200).json({
            success: true,
            message: 'Work parameter deleted successfully'
        });

    } catch (e: any) {
        console.error('Delete Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= GET PARAMETERS BY WORK ID ================= */
export const getParametersByWorkId = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const WorkParameterModel = initializeWorkParameterModel(sequelizeInstance);
        const WorkMasterModel = initializeWorkMasterModel(sequelizeInstance);
        
        const { workId } = req.params;

        if (!workId || isNaN(Number(workId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid Work ID is required'
            });
        }

        const parameters = await WorkParameterModel.findAll({
            where: { Work_Id: Number(workId) },
            include: [{
                model: WorkMasterModel,
                as: 'workMaster',
                where: { Work_Id: Number(workId) },
                required: false,
                attributes: ['Work_Dt', 'Work_Status']
            }],
            order: [['Param_Id', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Parameters retrieved successfully',
            data: parameters
        });

    } catch (e: any) {
        console.error('Get By Work ID Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= GET PARAMETERS BY TASK ID ================= */
export const getParametersByTaskId = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const WorkParameterModel = initializeWorkParameterModel(sequelizeInstance);
        const WorkMasterModel = initializeWorkMasterModel(sequelizeInstance);
        
        const { taskId } = req.params;

        if (!taskId || isNaN(Number(taskId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid Task ID is required'
            });
        }

        const parameters = await WorkParameterModel.findAll({
            where: { Task_Id: Number(taskId) },
            include: [{
                model: WorkMasterModel,
                as: 'workMaster',
                required: false,
                attributes: ['Work_Id', 'Work_Dt', 'Work_Status']
            }],
            order: [['Work_Id', 'ASC'], ['Param_Id', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Parameters retrieved successfully',
            data: parameters
        });

    } catch (e: any) {
        console.error('Get By Task ID Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= GET PARAMETERS BY PARAM ID ================= */
export const getParametersByParamId = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const WorkParameterModel = initializeWorkParameterModel(sequelizeInstance);
        const WorkMasterModel = initializeWorkMasterModel(sequelizeInstance);
        
        const { paramId } = req.params;

        if (!paramId || isNaN(Number(paramId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid Parameter ID is required'
            });
        }

        const parameters = await WorkParameterModel.findAll({
            where: { Param_Id: Number(paramId) },
            include: [{
                model: WorkMasterModel,
                as: 'workMaster',
                required: false,
                attributes: ['Work_Id', 'Work_Dt', 'Work_Status']
            }],
            order: [['Work_Id', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Parameters retrieved successfully',
            data: parameters
        });

    } catch (e: any) {
        console.error('Get By Param ID Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

/* ================= BULK CREATE WORK PARAMETERS ================= */
export const bulkCreateWorkParameters = async (req: Request, res: Response) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const WorkParameterModel = initializeWorkParameterModel(sequelizeInstance);
        const WorkMasterModel = initializeWorkMasterModel(sequelizeInstance);
        
        const validation = validateWithZod<WorkParameterCreateInput[]>(
            workParameterCreateSchema.array(),
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: validation.errors 
            });
        }

        const parametersData = validation.data!;
        
        // Check for duplicate combinations within the batch
        const combinations = new Set();
        const duplicates: string[] = [];

        for (const data of parametersData) {
            const key = `${data.Work_Id}-${data.Param_Id}`;
            if (combinations.has(key)) {
                duplicates.push(`Work_Id: ${data.Work_Id}, Param_Id: ${data.Param_Id}`);
            }
            combinations.add(key);
        }

        if (duplicates.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate combinations found in batch',
                duplicates
            });
        }

        // Check if all Work_Id exist in WorkMaster
        const workIds = [...new Set(parametersData.map(p => p.Work_Id))];
        const existingWorks = await WorkMasterModel.findAll({
            where: { Work_Id: { [Op.in]: workIds } },
            attributes: ['Work_Id']
        });

        const existingWorkIds = existingWorks.map(w => w.Work_Id);
        const missingWorkIds = workIds.filter(id => !existingWorkIds.includes(id));

        if (missingWorkIds.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some Work IDs do not exist in Work Master',
                missingWorkIds
            });
        }

        // Check for existing combinations in database
        const existingParameters = await WorkParameterModel.findAll({
            where: {
                [Op.or]: parametersData.map(p => ({
                    Work_Id: p.Work_Id,
                    Param_Id: p.Param_Id
                }))
            },
            attributes: ['Work_Id', 'Param_Id']
        });

        if (existingParameters.length > 0) {
            const existingPairs = existingParameters.map(p => 
                `Work_Id: ${p.Work_Id}, Param_Id: ${p.Param_Id}`
            );
            return res.status(409).json({
                success: false,
                message: 'Some parameter combinations already exist',
                existing: existingPairs
            });
        }

        const createdParameters = await WorkParameterModel.bulkCreate(parametersData);

        // Fetch created parameters with associations
        const createdIds = createdParameters.map(p => p.WNo);
        const results = await WorkParameterModel.findAll({
            where: { WNo: { [Op.in]: createdIds } },
            include: [{
                model: WorkMasterModel,
                as: 'workMaster',
                required: false,
                attributes: ['Work_Id', 'Work_Dt', 'Work_Status']
            }],
            order: [['Work_Id', 'ASC'], ['Param_Id', 'ASC']]
        });

        return res.status(201).json({
            success: true,
            message: `${results.length} work parameters created successfully`,
            data: results
        });

    } catch (e: any) {
        console.error('Bulk Create Error:', e);
        
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'Duplicate entry: Some parameter combinations already exist'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};