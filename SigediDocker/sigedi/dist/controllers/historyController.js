"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllHistory = exports.deleteHistoryRecord = exports.getHistory = void 0;
const db_1 = __importDefault(require("../database/db"));
const getHistory = async (req, res) => {
    try {
        const [history] = await db_1.default.execute(`
      SELECT h.*, u.name as user_name 
      FROM history h
    LEFT JOIN users u ON h.user_id = u.id
      ORDER BY h.created_at DESC
    `);
        res.json({ success: true, data: history });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar histórico.' });
    }
};
exports.getHistory = getHistory;
const deleteHistoryRecord = async (req, res) => {
    const { id } = req.params;
    try {
        await db_1.default.execute('DELETE FROM history WHERE id = ?', [id]);
        res.json({ success: true, message: 'Registro de histórico excluído com sucesso.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao excluir registro.' });
    }
};
exports.deleteHistoryRecord = deleteHistoryRecord;
const clearAllHistory = async (req, res) => {
    try {
        // Utilizando DELETE ao invés de TRUNCATE para evitar problemas com chaves estrangeiras caso existam no futuro
        await db_1.default.execute('DELETE FROM history');
        res.json({ success: true, message: 'Todo o histórico foi limpo permanentemente.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao limpar histórico.' });
    }
};
exports.clearAllHistory = clearAllHistory;
//# sourceMappingURL=historyController.js.map