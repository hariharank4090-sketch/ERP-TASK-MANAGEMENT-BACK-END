import express from 'express';

import taskTypeRoutes from './taskType.routes';
import projectRoutes from './project.routes';       

import processMasterRoutes from './processMaster.routes';
import taskParamTypeRoutes from './taskParamType.route';
import paramMasterRoutes from './paramMaster.routes';
import dropdownRoutes from './dropdown.route';
// import userRoutes from './user.routes';
import taskRoutes from './task.routes';
import LeavetypeRoutes from './leaveType.route';
// import ProjectEmployee from './employeeinvolved.route';
import employees from './employeemaster.route';
import projectSchedule from './projectSchedule.route';
import projectScheduleEmp from './projectScheduleEmp.route';
import WorkParameter from './workParameter.routes';
import  WorkMaster  from './workMaster.routes';
import  TaskEmployeeParameters from './TaskEmployeeParameters.router';
import leavemaster from './leave.routes';
const router = express.Router();


router.use('/taskType', taskTypeRoutes)
router.use('/project',projectRoutes)

router.use('/processMaster',processMasterRoutes)
// router.use('/projectEmployee',ProjectEmployee)
router.use('/parametDataTypes',taskParamTypeRoutes)
router.use('/paramMaster',paramMasterRoutes)
router.use('/dropdowns',dropdownRoutes)
// router.use('/users',userRoutes)

router.use('/tasks',taskRoutes)
// router.use('/company',taskRoutes)
router.use('/Leavetype',LeavetypeRoutes)
router.use('/employees',employees)
router.use('/projectSchedule',projectSchedule)
router.use('/projectScheduleEmp',projectScheduleEmp)
router.use('/workParameter',WorkParameter)
router.use('/taskParameterDetails',TaskEmployeeParameters)
router.use('/workMaster',WorkMaster)
router.use('/leave',leavemaster)


export default router;