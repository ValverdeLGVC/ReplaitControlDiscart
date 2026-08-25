import pool from '../database/db';

export const logAction = async (
    userId: number,
    action: string,
    entityAffected: string,
    entityId: number,
    description: string
) => {
    try {
        const query = `
      INSERT INTO history (user_id, action, entity_affected, entity_id, description) 
      VALUES (?, ?, ?, ?, ?)
    `;
        await pool.execute(query, [userId, action, entityAffected, entityId, description]);
    } catch (error) {
        console.error('Erro ao registrar histórico:', error);
    }
};