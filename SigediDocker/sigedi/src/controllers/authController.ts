import { Request, Response } from 'express';
import pool from '../database/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const [users]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            res.status(401).json({ success: false, message: 'Credenciais inválidas' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ success: false, message: 'Credenciais inválidas' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '8h' }
        );

        // Registra o login no histórico
        const queryHistory = `INSERT INTO history (user_id, action, entity_affected, entity_id, description) VALUES (?, ?, ?, ?, ?)`;
        await pool.execute(queryHistory, [user.id, 'LOGIN', 'users', user.id, 'Usuário realizou login no sistema']);

        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor' });
    }
};