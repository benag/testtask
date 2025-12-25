"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const translationController_1 = require("../controllers/translationController");
const router = (0, express_1.Router)();
const translationController = new translationController_1.TranslationController();
router.get('/languages', translationController.getLanguages.bind(translationController));
router.get('/:language', translationController.getTranslations.bind(translationController));
exports.default = router;
//# sourceMappingURL=translations.js.map