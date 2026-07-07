"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const companyDb_middleware_1 = require("../middleware/companyDb.middleware");
const router = express_1.default.Router();
router.use(companyDb_middleware_1.setCompanyDatabase);
router.get('/users', companyDb_middleware_1.requireAuthMiddleware, companyDb_middleware_1.requireCompanyDB, user_controller_1.getUsers);
exports.default = router;
