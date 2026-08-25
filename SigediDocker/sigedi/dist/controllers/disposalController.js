"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestDisposal = void 0;
const db_1 = __importDefault(require("../database/db"));
const historyLogger_1 = require("../utils/historyLogger");
const requestDisposal = async (req, res) => {
    const { equipment_id, reason } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não identificado.' });
        return;
    }
    if (!equipment_id || !reason || !reason.trim()) {
        res.status(400).json({ success: false, message: 'Informe o equipamento e o motivo da solicitação.' });
        return;
    }
    try {
        const [equipmentRows] = await db_1.default.execute('SELECT id, status FROM equipment WHERE id = ?', [equipment_id]);
        if (equipmentRows.length === 0) {
            res.status(404).json({ success: false, message: 'Equipamento não encontrado.' });
            return;
        }
        if (equipmentRows[0].status === 'Descartado') {
            res.status(400).json({ success: false, message: 'Equipamento já foi descartado.' });
            return;
        }
        const [lastRequestRows] = await db_1.default.execute('SELECT status FROM disposal_requests WHERE equipment_id = ? ORDER BY id DESC LIMIT 1', [equipment_id]);
        if (lastRequestRows.length > 0 && lastRequestRows[0].status !== 'Negado') {
            res.status(409).json({ success: false, message: 'Este equipamento já possui uma solicitação pendente ou autorizada.' });
            return;
        }
        // 1. Registra a solicitação
        const query = `
      INSERT INTO disposal_requests (equipment_id, requested_by_user_id, reason, status) 
      VALUES (?, ?, ?, 'Pendente')
    `;
        await db_1.default.execute(query, [equipment_id, userId, reason.trim()]);
        // 2. Atualiza o status do equipamento para "Aguardando descarte"
        await db_1.default.execute(`UPDATE equipment SET status = 'Aguardando descarte' WHERE id = ?`, [equipment_id]);
        // 3. Registra na trilha de auditoria
        await (0, historyLogger_1.logAction)(userId, 'SOLICITAÇÃO DE DESCARTE', 'equipment', equipment_id, `Solicitação registrada. Motivo: ${reason}`);
        res.status(201).json({ success: true, message: 'Solicitação de descarte registrada com sucesso.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao solicitar descarte.' });
    }
};
exports.requestDisposal = requestDisposal;
//# sourceMappingURL=disposalController.js.map