"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Backend API",
            version: "1.0.0",
        },
        servers: [
            {
                url: "http://localhost:5001",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                JwtUser: {
                    type: "object",
                    properties: {
                        id: { type: "number", example: 1 },
                        userType: { type: "number", example: 1 },
                        name: { type: "string", example: "Admin" },
                        uniqueName: { type: "string", example: "admin" },
                        branchId: { type: "number", example: 101 },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: [
        "./src/routes/**/*.ts",
        "./src/controllers/**/*.ts",
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
