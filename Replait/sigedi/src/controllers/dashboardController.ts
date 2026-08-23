import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import pool from '../database/db';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [stats]: any = await pool.execute(`
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
};