"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAllocations = exports.getCompanies = void 0;
const db_1 = __importDefault(require("../database/db"));
const getCompanies = async (req, res) => {
    try {
        const [companies] = await db_1.default.execute('SELECT * FROM companies WHERE status = "ACTIVE"');
        res.json({ success: true, data: companies });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar empresas' });
    }
};
exports.getCompanies = getCompanies;
const getMyAllocations = async (req, res) => {
    const userId = req.user?.id;
    // Adicione esta validação para satisfazer o TypeScript
    if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não identificado.' });
        return;
    }
    try {
        const [allocations] = await db_1.default.execute(`
      SELECT c.id, c.name, c.cnpj 
      FROM allocations a
      INNER JOIN professionals p ON a.professional_id = p.id
      INNER JOIN companies c ON a.client_company_id = c.id
      WHERE p.user_id = ? AND a.status = 'ACTIVE'
    `, [userId]); // Agora o TS sabe que userId é um número válido
        res.json({ success: true, data: allocations });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar alocações' });
    }
};
exports.getMyAllocations = getMyAllocations;
//# sourceMappingURL=companyController.js.map