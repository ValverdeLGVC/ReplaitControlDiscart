"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = void 0;
const db_1 = __importDefault(require("../database/db"));
const getCategories = async (req, res) => {
    try {
        const [categories] = await db_1.default.execute('SELECT * FROM categories ORDER BY name ASC');
        res.json({ success: true, data: categories });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar categorias' });
    }
};
exports.getCategories = getCategories;
//# sourceMappingURL=categoryController.js.map