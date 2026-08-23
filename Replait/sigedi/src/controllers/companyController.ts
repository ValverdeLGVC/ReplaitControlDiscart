import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import pool from '../database/db';

export const getCompanies = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [companies]: any = await pool.execute('SELECT * FROM companies WHERE status = "ACTIVE"');
        res.json({ success: true, data: companies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar empresas' });
    }
};

export const getMyAllocations = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    // Adicione esta validação para satisfazer o TypeScript
    if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não identificado.' });
        return;
    }

    try {
        const [allocations]: any = await pool.execute(`
      SELECT c.id, c.name, c.cnpj 
      FROM allocations a
      INNER JOIN professionals p ON a.professional_id = p.id
      INNER JOIN companies c ON a.client_company_id = c.id
      WHERE p.user_id = ? AND a.status = 'ACTIVE'
    `, [userId]); // Agora o TS sabe que userId é um número válido

        res.json({ success: true, data: allocations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar alocações' });
    }
};