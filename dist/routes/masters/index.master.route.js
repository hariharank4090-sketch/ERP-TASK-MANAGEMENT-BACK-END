"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskType_routes_1 = __importDefault(require("./taskType.routes"));
const project_routes_1 = __importDefault(require("./project.routes"));
const processMaster_routes_1 = __importDefault(require("./processMaster.routes"));
const taskParamType_route_1 = __importDefault(require("./taskParamType.route"));
const paramMaster_routes_1 = __importDefault(require("./paramMaster.routes"));
const dropdown_route_1 = __importDefault(require("./dropdown.route"));
// import userRoutes from './user.routes';
const task_routes_1 = __importDefault(require("./task.routes"));
const leaveType_route_1 = __importDefault(require("./leaveType.route"));
// import ProjectEmployee from './employeeinvolved.route';
const employeemaster_route_1 = __importDefault(require("./employeemaster.route"));
const projectSchedule_route_1 = __importDefault(require("./projectSchedule.route"));
const projectScheduleEmp_route_1 = __importDefault(require("./projectScheduleEmp.route"));
const workParameter_routes_1 = __importDefault(require("./workParameter.routes"));
const workMaster_routes_1 = __importDefault(require("./workMaster.routes"));
const TaskEmployeeParameters_router_1 = __importDefault(require("./TaskEmployeeParameters.router"));
const leave_routes_1 = __importDefault(require("./leave.routes"));
const router = express_1.default.Router();
router.use('/taskType', taskType_routes_1.default);
router.use('/project', project_routes_1.default);
router.use('/processMaster', processMaster_routes_1.default);
// router.use('/projectEmployee',ProjectEmployee)
router.use('/parametDataTypes', taskParamType_route_1.default);
router.use('/paramMaster', paramMaster_routes_1.default);
router.use('/dropdowns', dropdown_route_1.default);
// router.use('/users',userRoutes)
router.use('/tasks', task_routes_1.default);
// router.use('/company',taskRoutes)
router.use('/Leavetype', leaveType_route_1.default);
router.use('/employees', employeemaster_route_1.default);
router.use('/projectSchedule', projectSchedule_route_1.default);
router.use('/projectScheduleEmp', projectScheduleEmp_route_1.default);
router.use('/workParameter', workParameter_routes_1.default);
router.use('/taskParameterDetails', TaskEmployeeParameters_router_1.default);
router.use('/workMaster', workMaster_routes_1.default);
router.use('/leave', leave_routes_1.default);
exports.default = router;
