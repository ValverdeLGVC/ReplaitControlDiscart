import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import pool from '../database/db';

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [categories]: any = await pool.execute('SELECT * FROM categories ORDER BY name ASC');
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar categorias' });
    }
};