"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fingerPrint_route_1 = __importDefault(require("../attendance/fingerPrint.route"));
const salesPerson_route_1 = __importDefault(require("./salesPerson.route"));
const user_routes_1 = __importDefault(require("./user.routes"));
const requireAuth_1 = require("../../controllers/configuration/login/requireAuth");
const router = express_1.default.Router();
router.use('/fingerPrint', requireAuth_1.requireAuth, fingerPrint_route_1.default);
router.use('/salesperson', requireAuth_1.requireAuth, salesPerson_route_1.default);
router.use('/users', requireAuth_1.requireAuth, user_routes_1.default);
exports.default = router;
