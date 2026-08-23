import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import pool from '../database/db';
import { logAction } from '../utils/historyLogger';

export const requestDisposal = async (req: AuthRequest, res: Response): Promise<void> => {
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
        const [equipmentRows]: any = await pool.execute(
            'SELECT id, status FROM equipment WHERE id = ?',
            [equipment_id]
        );
        if (equipmentRows.length === 0) {
            res.status(404).json({ success: false, message: 'Equipamento não encontrado.' });
            return;
        }
        if (equipmentRows[0].status === 'Descartado') {
            res.status(400).json({ success: false, message: 'Equipamento já foi descartado.' });
            return;
        }

        const [lastRequestRows]: any = await pool.execute(
            'SELECT status FROM disposal_requests WHERE equipment_id = ? ORDER BY id DESC LIMIT 1',
            [equipment_id]
        );
        if (lastRequestRows.length > 0 && lastRequestRows[0].status !== 'Negado') {
            res.status(409).json({ success: false, message: 'Este equipamento já possui uma solicitação pendente ou autorizada.' });
            return;
        }

        // 1. Registra a solicitação
        const query = `
      INSERT INTO disposal_requests (equipment_id, requested_by_user_id, reason, status) 
      VALUES (?, ?, ?, 'Pendente')
    `;
        await pool.execute(query, [equipment_id, userId, reason.trim()]);

        // 2. Atualiza o status do equipamento para "Aguardando descarte"
        await pool.execute(`UPDATE equipment SET status = 'Aguardando descarte' WHERE id = ?`, [equipment_id]);

        // 3. Registra na trilha de auditoria
        await logAction(userId, 'SOLICITAÇÃO DE DESCARTE', 'equipment', equipment_id, `Solicitação registrada. Motivo: ${reason}`);

        res.status(201).json({ success: true, message: 'Solicitação de descarte registrada com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao solicitar descarte.' });
    }
};