"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.relocateEquipment = exports.deleteEquipment = exports.createEquipment = exports.getEquipments = void 0;
const db_1 = __importDefault(require("../database/db"));
const historyLogger_1 = require("../utils/historyLogger");
const getEquipments = async (req, res) => {
    try {
        const [equipments] = await db_1.default.execute(`
            SELECT 
                e.id, 
                e.patrimony_code,
                e.name, 
                e.serial_number, 
                e.status, 
                c.id as company_id,
                c.name as company_name,
                cat.name as category_name
            FROM equipment e
            LEFT JOIN companies c ON e.client_company_id = c.id
            LEFT JOIN categories cat ON e.category_id = cat.id
            ORDER BY e.id DESC
        `);
        res.json({ success: true, data: equipments });
    }
    catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar equipamentos.' });
    }
};
exports.getEquipments = getEquipments;
const createEquipment = async (req, res) => {
    const { name, category_id, manufacturer, model, serial_number, client_company_id, status, location, observations } = req.body;
    const patrimonyCode = String(req.body.patrimony_code ?? req.body.patrimony ?? '').trim() || null;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
    }
    try {
        const [compCheck] = await db_1.default.execute('SELECT type FROM companies WHERE id = ?', [client_company_id]);
        if (compCheck.length === 0 || compCheck[0].type !== 'CLIENT') {
            res.status(400).json({ success: false, message: 'Erro: Equipamentos só podem ser vinculados a empresas do tipo CLIENTE!' });
            return;
        }
        const [result] = await db_1.default.execute(`INSERT INTO equipment (
                patrimony_code, name, category_id, manufacturer, model, serial_number, 
                status, is_working, location, client_company_id, observations, created_by_user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            patrimonyCode,
            name,
            category_id || 1,
            manufacturer || null,
            model || null,
            serial_number || null,
            status || 'Funcionando',
            1,
            location || null,
            client_company_id,
            observations || null,
            userId
        ]);
        await (0, historyLogger_1.logAction)(userId, 'CADASTRO', 'equipment', result.insertId, `Equipamento ${name} cadastrado`);
        res.status(201).json({ success: true, message: 'Equipamento cadastrado com sucesso!' });
    }
    catch (error) {
        console.error('Erro detalhado ao cadastrar equipamento:', error);
        res.status(500).json({ success: false, message: `Erro no Banco: ${error.sqlMessage || error.message}` });
    }
};
exports.createEquipment = createEquipment;
const deleteEquipment = async (req, res) => {
    const { id } = req.params;
    const { check_only, delete_history } = req.body || {};
    const userId = req.user?.id;
    try {
        const [equipmentRows] = await db_1.default.execute(`SELECT e.id, e.client_company_id, c.name as company_name
             FROM equipment e LEFT JOIN companies c ON e.client_company_id = c.id
             WHERE e.id = ?`, [id]);
        if (equipmentRows.length === 0) {
            res.status(404).json({ success: false, message: 'Equipamento não encontrado.' });
            return;
        }
        if (equipmentRows[0].client_company_id) {
            res.status(409).json({
                success: false,
                message: 'Desaloque este material antes de excluí-lo.',
                dependencies: [`Equipamento alocado em ${equipmentRows[0].company_name || 'uma empresa cliente'}; usar Desalocar Material no Painel de Controle`]
            });
            return;
        }
        if (check_only) {
            res.json({ success: true, ready: true });
            return;
        }
        await db_1.default.execute('SET FOREIGN_KEY_CHECKS = 0');
        await db_1.default.execute('DELETE FROM disposal_requests WHERE equipment_id = ?', [id]);
        await db_1.default.execute('DELETE FROM equipment WHERE id = ?', [id]);
        await db_1.default.execute('SET FOREIGN_KEY_CHECKS = 1');
        if (userId) {
            await (0, historyLogger_1.logAction)(userId, 'EXCLUSÃO DEFINITIVA', 'equipment', Number(id), `Equipamento ID ${id} excluído.`);
        }
        if (delete_history)
            await db_1.default.execute("DELETE FROM history WHERE entity_affected IN ('equipment', 'equipments') AND entity_id = ?", [id]);
        res.json({ success: true, message: 'Equipamento excluído permanentemente!' });
    }
    catch (error) {
        await db_1.default.execute('SET FOREIGN_KEY_CHECKS = 1').catch(() => { });
        res.status(500).json({ success: false, message: `Erro ao excluir equipamento: ${error.message}` });
    }
};
exports.deleteEquipment = deleteEquipment;
const relocateEquipment = async (req, res) => {
    const { id } = req.params;
    const { client_company_id, status } = req.body;
    const userId = req.user?.id;
    try {
        const [compCheck] = await db_1.default.execute('SELECT type FROM companies WHERE id = ?', [client_company_id]);
        if (compCheck.length === 0 || compCheck[0].type !== 'CLIENT') {
            res.status(400).json({ success: false, message: 'Erro: A empresa de destino deve ser do tipo CLIENTE!' });
            return;
        }
        await db_1.default.execute('UPDATE equipment SET client_company_id = ?, status = ? WHERE id = ?', [client_company_id, status || 'Funcionando', id]);
        if (userId) {
            await (0, historyLogger_1.logAction)(userId, 'ATUALIZAÇÃO', 'equipment', Number(id), `Equipamento ID ${id} realocado para empresa ID ${client_company_id}`);
        }
        res.json({ success: true, message: 'Equipamento realocado com sucesso!' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao realocar equipamento.' });
    }
};
exports.relocateEquipment = relocateEquipment;
//# sourceMappingURL=equipmentController.js.map