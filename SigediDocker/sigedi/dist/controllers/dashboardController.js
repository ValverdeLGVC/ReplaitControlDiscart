"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const db_1 = __importDefault(require("../database/db"));
const getDashboardStats = async (req, res) => {
    try {
        const [stats] = await db_1.default.execute(`
            SELECT
                COUNT(e.id) as total,
                SUM(CASE WHEN e.is_working = 1 THEN 1 ELSE 0 END) as funcionando,
                SUM(CASE WHEN e.status = 'Descartado' THEN 1 ELSE 0 END) as danificados,
                (
                    SELECT COUNT(*)
                    FROM disposal_requests d_pending
                    WHERE d_pending.status = 'Pendente'
                ) as aguardando_avaliacao
            FROM equipment e
        `);
        res.json({ success: true, data: stats[0] });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=dashboardController.js.map