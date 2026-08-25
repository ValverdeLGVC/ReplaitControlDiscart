import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import pool from '../database/db';

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [history]: any = await pool.execute(`
      SELECT h.*, u.name as user_name 
      FROM history h
    LEFT JOIN users u ON h.user_id = u.id
      ORDER BY h.created_at DESC
    `);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar histórico.' });
    }
};

export const deleteHistoryRecord = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM history WHERE id = ?', [id]);
        res.json({ success: true, message: 'Registro de histórico excluído com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao excluir registro.' });
    }
};

export const clearAllHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Utilizando DELETE ao invés de TRUNCATE para evitar problemas com chaves estrangeiras caso existam no futuro
        await pool.execute('DELETE FROM history');
        res.json({ success: true, message: 'Todo o histórico foi limpo permanentemente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao limpar histórico.' });
    }
};