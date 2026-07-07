"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const requireAuth_1 = require("../../controllers/configuration/login/requireAuth");
const appMenu_route_1 = __importDefault(require("./appMenu.route"));
const login_route_1 = __importDefault(require("./login.route"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.use('/appMenu', requireAuth_1.requireAuth, appMenu_route_1.default);
router.use('/login', login_route_1.default);
exports.default = router;
