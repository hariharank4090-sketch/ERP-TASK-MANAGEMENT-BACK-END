"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_config_route_1 = __importDefault(require("./configuration/index.config.route"));
const index_master_route_1 = __importDefault(require("./masters/index.master.route"));
const index_attendance_route_1 = __importDefault(require("./attendance/index.attendance.route"));
const requireAuth_1 = require("../controllers/configuration/login/requireAuth");
const router = express_1.default.Router();
router.use('/configuration', index_config_route_1.default);
router.use('/masters', requireAuth_1.requireAuth, index_master_route_1.default);
router.use('/attendance', requireAuth_1.requireAuth, index_attendance_route_1.default);
exports.default = router;
