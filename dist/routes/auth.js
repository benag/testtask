"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController();
router.post('/register', (0, validation_1.validateRequest)(validation_1.schemas.register), authController.register.bind(authController));
router.post('/login', (0, validation_1.validateRequest)(validation_1.schemas.login), authController.login.bind(authController));
router.get('/me', auth_1.authenticateToken, authController.me.bind(authController));
router.put('/language', auth_1.authenticateToken, authController.updateLanguage.bind(authController));
exports.default = router;
//# sourceMappingURL=auth.js.map