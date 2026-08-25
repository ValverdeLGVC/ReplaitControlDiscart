"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProfessionalCompanies = exports.removeAllocations = exports.getPeopleAllocations = exports.removeEquipmentAllocations = exports.removeEquipmentAllocation = exports.decideDisposal = exports.deleteSupportUser = exports.updateSupportUser = exports.createUser = exports.removeAllocation = exports.createAllocation = exports.getActiveAllocations = exports.getProfessionals = exports.getCompanyOverview = exports.deleteCompany = exports.updateCompany = exports.createCompany = void 0;
const db_1 = __importDefault(require("../database/db"));
const historyLogger_1 = require("../utils/historyLogger");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ==========================================
// EMPRESAS
// ==========================================
const createCompany = async (req, res) => {
    const { name, cnpj, type } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
    }
    try {
        const [result] = await db_1.default.execute('INSERT INTO companies (name, cnpj, type, status) VALUES (?, ?, ?, "ACTIVE")', [name, cnpj || null, type]);
        await (0, historyLogger_1.logAction)(userId, 'CADASTRO', 'companies', result.insertId, `Empresa ${name} cadastrada`);
        res.status(201).json({ success: true, message: 'Empresa cadastrada com sucesso!' });
    }
    catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        res.status(500).json({ success: false, message: `Erro ao cadastrar empresa: ${error.sqlMessage || error.message}` });
    }
};
exports.createCompany = createCompany;
const updateCompany = async (req, res) => {
    const { id } = req.params;
    const { name, cnpj, type } = req.body;
    const userId = req.user?.id;
    try {
        await db_1.default.execute('UPDATE companies SET name = ?, cnpj = ?, type = ? WHERE id = ?', [name, cnpj || null, type, id]);
        if (userId) {
            await (0, historyLogger_1.logAction)(userId, 'ATUALIZAÇÃO', 'companies', Number(id), `Empresa ID ${id} atualizada.`);
        }
        res.json({ success: true, message: 'Empresa atualizada com sucesso!' });
    }
    catch (error) {
        console.error('Erro detalhado ao atualizar empresa:', error);
        res.status(500).json({ success: false, message: `Erro no Banco ao atualizar empresa: ${error.sqlMessage || error.message}` });
    }
};
exports.updateCompany = updateCompany;
const deleteCompany = async (req, res) => {
    const { id } = req.params;
    const { check_only, delete_history } = req.body || {};
    const userId = req.user?.id;
    try {
        const [companyRows] = await db_1.default.execute('SELECT id FROM companies WHERE id = ?', [id]);
        if (companyRows.length === 0) {
            res.status(404).json({ success: false, message: 'Empresa não encontrada.' });
            return;
        }
        const [equipmentRows] = await db_1.default.execute('SELECT id FROM equipment WHERE client_company_id = ?', [id]);
        const [allocationRows] = await db_1.default.execute("SELECT a.id, u.name FROM allocations a JOIN professionals p ON a.professional_id = p.id JOIN users u ON p.user_id = u.id WHERE a.client_company_id = ? AND (a.status IS NULL OR UPPER(TRIM(a.status)) NOT IN ('FINISHED', 'ENCERRADO', 'INACTIVE', 'INATIVO'))", [id]);
        const [professionalRows] = await db_1.default.execute('SELECT p.id, u.name FROM professionals p JOIN users u ON p.user_id = u.id WHERE p.provider_company_id = ?', [id]);
        const dependencies = [];
        if (equipmentRows.length)
            dependencies.push(`${equipmentRows.length} equipamento(s) em Equipamentos; desalocar o material primeiro`);
        if (allocationRows.length)
            dependencies.push(`${allocationRows.length} colaborador(es) em Alocações Ativas; desalocar os colaboradores primeiro`);
        if (professionalRows.length)
            dependencies.push(`${professionalRows.length} profissional(is) em Usuários & Profissionais; remover/desvincular os profissionais primeiro`);
        if (dependencies.length > 0) {
            res.status(409).json({
                success: false,
                message: 'Não é possível excluir esta empresa enquanto houver vínculos.',
                dependencies
            });
            return;
        }
        if (check_only) {
            res.json({ success: true, ready: true });
            return;
        }
        await db_1.default.execute('DELETE FROM allocations WHERE client_company_id = ?', [id]);
        await db_1.default.execute('DELETE FROM companies WHERE id = ?', [id]);
        if (userId) {
            await (0, historyLogger_1.logAction)(userId, 'EXCLUSÃO DEFINITIVA', 'companies', Number(id), `Empresa ID ${id} excluída permanentemente.`);
        }
        if (delete_history)
            await db_1.default.execute("DELETE FROM history WHERE entity_affected IN ('companies', 'company') AND entity_id = ?", [id]);
        res.json({ success: true, message: 'Empresa excluída permanentemente com sucesso!' });
    }
    catch (error) {
        console.error('Erro ao excluir empresa:', error);
        res.status(500).json({ success: false, message: `Erro ao excluir empresa: ${error.message}` });
    }
};
exports.deleteCompany = deleteCompany;
const getCompanyOverview = async (req, res) => {
    const { id } = req.params;
    try {
        const [companyData] = await db_1.default.execute('SELECT * FROM companies WHERE id = ?', [id]);
        const [allocations] = await db_1.default.execute(`
            SELECT a.id, u_prof.name as professional_name, u_alloc.name as allocated_by, a.start_date
            FROM allocations a
            JOIN professionals p ON a.professional_id = p.id
            JOIN users u_prof ON p.user_id = u_prof.id
            JOIN users u_alloc ON a.allocated_by_user_id = u_alloc.id
            WHERE a.client_company_id = ? AND a.status = 'ACTIVE'
        `, [id]);
        const [equipmentStats] = await db_1.default.execute(`
            SELECT 
                COUNT(id) as total,
                SUM(CASE WHEN status = 'Funcionando' THEN 1 ELSE 0 END) as funcionando,
                SUM(CASE WHEN status = 'Danificado' THEN 1 ELSE 0 END) as danificados,
                SUM(CASE WHEN status = 'Aguardando descarte' THEN 1 ELSE 0 END) as aguardando_descarte
            FROM equipment WHERE client_company_id = ?
        `, [id]);
        const [requests] = await db_1.default.execute(`
            SELECT 
                d.id, 
                e.id as equipment_id, 
                e.name as equipment, 
                d.reason, 
                d.status, 
                u_req.name as requested_by, 
                u_dec.name as decided_by,
                d.decision_notes,
                d.request_date,
                d.decision_date
            FROM disposal_requests d
            JOIN equipment e ON d.equipment_id = e.id
            JOIN users u_req ON d.requested_by_user_id = u_req.id
            LEFT JOIN users u_dec ON d.decided_by_user_id = u_dec.id
            WHERE e.client_company_id = ?
            ORDER BY d.request_date DESC
        `, [id]);
        res.json({
            success: true,
            data: {
                company: companyData[0],
                allocations,
                stats: equipmentStats[0],
                requests
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar dados da empresa.' });
    }
};
exports.getCompanyOverview = getCompanyOverview;
// ==========================================
// PROFISSIONAIS E ALOCAÇÕES
// ==========================================
const getProfessionals = async (req, res) => {
    try {
        const [professionals] = await db_1.default.execute(`
            SELECT u.id as user_id, p.id as professional_id, u.name, u.email, u.role, p.phone, c.id as provider_id, c.name as provider
            FROM professionals p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN companies c ON p.provider_company_id = c.id
        `);
        res.json({ success: true, data: professionals });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar profissionais.' });
    }
};
exports.getProfessionals = getProfessionals;
const getActiveAllocations = async (req, res) => {
    try {
        const [allocations] = await db_1.default.execute(`
            SELECT 
                a.id, 
                a.professional_id,
                a.client_company_id as company_id,
                u.id as collaborator_id,
                u.name as professional_name, 
                provider.id as provider_company_id,
                provider.name as provider_company_name,
                c.name as company_name, 
                a.start_date, 
                a.end_date,
                COALESCE(a.status, 'ACTIVE') as status
            FROM allocations a
            JOIN professionals p ON a.professional_id = p.id
            JOIN users u ON p.user_id = u.id
                LEFT JOIN companies provider ON p.provider_company_id = provider.id
            JOIN companies c ON a.client_company_id = c.id
                WHERE a.status IS NULL
                    OR UPPER(TRIM(a.status)) NOT IN ('FINISHED', 'ENCERRADO', 'INACTIVE', 'INATIVO')
            ORDER BY a.id DESC
        `);
        const [equipmentAllocations] = await db_1.default.execute(`
            SELECT
                e.id,
                e.patrimony_code,
                e.name as equipment_name,
                e.serial_number,
                e.status,
                c.id as company_id,
                c.name as company_name,
                d.id as disposal_request_id,
                d.reason as disposal_reason,
                d.status as disposal_status,
                d.request_date,
                u_req.name as requested_by,
                d.decision_notes,
                d.decision_date,
                u_dec.name as decided_by
            FROM equipment e
            INNER JOIN companies c ON e.client_company_id = c.id
            LEFT JOIN disposal_requests d ON d.id = (
                SELECT d2.id FROM disposal_requests d2
                WHERE d2.equipment_id = e.id
                ORDER BY d2.id DESC LIMIT 1
            )
            LEFT JOIN users u_req ON d.requested_by_user_id = u_req.id
            LEFT JOIN users u_dec ON d.decided_by_user_id = u_dec.id
                        WHERE e.client_company_id IS NOT NULL
            ORDER BY c.name ASC, e.id DESC
        `);
        res.json({ success: true, data: allocations, equipment: equipmentAllocations });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar alocações.' });
    }
};
exports.getActiveAllocations = getActiveAllocations;
const createAllocation = async (req, res) => {
    const { professional_id, client_company_id } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
    }
    if (!professional_id || !client_company_id) {
        res.status(400).json({ success: false, message: 'Selecione um profissional e uma empresa cliente.' });
        return;
    }
    try {
        const [professionalCheck] = await db_1.default.execute('SELECT id FROM professionals WHERE id = ?', [professional_id]);
        if (professionalCheck.length === 0) {
            res.status(400).json({ success: false, message: 'O profissional selecionado não foi encontrado.' });
            return;
        }
        const [compCheck] = await db_1.default.execute('SELECT type FROM companies WHERE id = ?', [client_company_id]);
        if (compCheck.length === 0 || compCheck[0].type !== 'CLIENT') {
            res.status(400).json({ success: false, message: 'Erro: Profissionais só podem ser alocados em empresas do tipo CLIENTE!' });
            return;
        }
        const [activeAllocation] = await db_1.default.execute("SELECT id FROM allocations WHERE professional_id = ? AND (status IS NULL OR UPPER(TRIM(status)) NOT IN ('FINISHED', 'ENCERRADO', 'INACTIVE', 'INATIVO'))", [professional_id]);
        if (activeAllocation.length > 0) {
            res.status(400).json({ success: false, message: 'Este profissional já possui uma alocação ativa.' });
            return;
        }
        const [result] = await db_1.default.execute('INSERT INTO allocations (professional_id, client_company_id, allocated_by_user_id, start_date, status) VALUES (?, ?, ?, CURDATE(), "ACTIVE")', [professional_id, client_company_id, userId]);
        await (0, historyLogger_1.logAction)(userId, 'ALOCAÇÃO', 'allocations', result.insertId, `Profissional vinculado à empresa cliente ID ${client_company_id}`);
        res.status(201).json({ success: true, message: 'Alocação realizada com sucesso!' });
    }
    catch (error) {
        console.error('Erro ao realizar alocação:', error);
        res.status(500).json({ success: false, message: `Erro ao realizar alocação: ${error.sqlMessage || error.message}` });
    }
};
exports.createAllocation = createAllocation;
const removeAllocation = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        await db_1.default.execute('UPDATE allocations SET status = "FINISHED", end_date = CURDATE() WHERE id = ?', [id]);
        if (userId)
            await (0, historyLogger_1.logAction)(userId, 'DESALOCAÇÃO', 'allocations', Number(id), `Alocação encerrada`);
        res.json({ success: true, message: 'Profissional desalocado com sucesso!' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao desalocar profissional.' });
    }
};
exports.removeAllocation = removeAllocation;
// ==========================================
// GESTÃO DE USUÁRIOS
// ==========================================
const createUser = async (req, res) => {
    const { name, email, password, role, provider_company_id, phone } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
    }
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const [userResult] = await db_1.default.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
        await db_1.default.execute('INSERT INTO professionals (user_id, provider_company_id, phone) VALUES (?, ?, ?)', [userResult.insertId, provider_company_id, phone]);
        await (0, historyLogger_1.logAction)(userId, 'CADASTRO', 'users', userResult.insertId, `Novo usuário ${name} cadastrado`);
        res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário.' });
    }
};
exports.createUser = createUser;
const updateSupportUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, phone } = req.body;
    const userId = req.user?.id;
    try {
        await db_1.default.execute('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, role, id]);
        await db_1.default.execute('UPDATE professionals SET phone = ? WHERE user_id = ?', [phone || null, id]);
        if (userId)
            await (0, historyLogger_1.logAction)(userId, 'ATUALIZAÇÃO', 'users', Number(id), `Usuário ID ${id} atualizado`);
        res.json({ success: true, message: 'Usuário atualizado com sucesso!' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar usuário.' });
    }
};
exports.updateSupportUser = updateSupportUser;
const deleteSupportUser = async (req, res) => {
    const { id } = req.params;
    const { check_only, delete_history } = req.body || {};
    const adminId = req.user?.id;
    if (!adminId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
    }
    try {
        const [userRows] = await db_1.default.execute('SELECT id FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
            return;
        }
        const [profRows] = await db_1.default.execute('SELECT id FROM professionals WHERE user_id = ?', [id]);
        const dependencies = [];
        if (profRows.length > 0) {
            const professionalId = profRows[0].id;
            const [allocationRows] = await db_1.default.execute("SELECT id FROM allocations WHERE professional_id = ? AND (status IS NULL OR UPPER(TRIM(status)) NOT IN ('FINISHED', 'ENCERRADO', 'INACTIVE', 'INATIVO'))", [professionalId]);
            if (allocationRows.length)
                dependencies.push(`${allocationRows.length} alocação(ões) ativa(s) em Alocações Ativas; desalocar o colaborador primeiro`);
        }
        if (dependencies.length > 0) {
            res.status(409).json({ success: false, message: 'Não é possível excluir este colaborador enquanto houver vínculos.', dependencies });
            return;
        }
        if (check_only) {
            res.json({ success: true, ready: true });
            return;
        }
        await db_1.default.execute('SET FOREIGN_KEY_CHECKS = 0');
        if (profRows.length > 0) {
            await db_1.default.execute('DELETE FROM allocations WHERE professional_id = ?', [profRows[0].id]);
            await db_1.default.execute('DELETE FROM professionals WHERE id = ?', [profRows[0].id]);
        }
        if (!delete_history)
            await db_1.default.execute('UPDATE history SET user_id = NULL WHERE user_id = ?', [id]);
        await db_1.default.execute('UPDATE disposal_requests SET requested_by_user_id = NULL WHERE requested_by_user_id = ?', [id]);
        await db_1.default.execute('UPDATE disposal_requests SET decided_by_user_id = NULL WHERE decided_by_user_id = ?', [id]);
        await db_1.default.execute('DELETE FROM users WHERE id = ?', [id]);
        await db_1.default.execute('SET FOREIGN_KEY_CHECKS = 1');
        await (0, historyLogger_1.logAction)(adminId, 'EXCLUSÃO DEFINITIVA', 'users', Number(id), `Usuário ID ${id} removido.`);
        if (delete_history)
            await db_1.default.execute("DELETE FROM history WHERE entity_affected IN ('users', 'user') AND entity_id = ?", [id]);
        res.json({ success: true, message: 'Funcionário excluído com sucesso!' });
    }
    catch (error) {
        await db_1.default.execute('SET FOREIGN_KEY_CHECKS = 1').catch(() => { });
        res.status(500).json({ success: false, message: 'Erro ao remover usuário.' });
    }
};
exports.deleteSupportUser = deleteSupportUser;
// ==========================================
// DESCARTE
// ==========================================
const decideDisposal = async (req, res) => {
    const { request_id, status, decision_notes, equipment_id } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
    }
    if (!['Autorizado', 'Negado'].includes(status)) {
        res.status(400).json({ success: false, message: 'Decisão de descarte inválida.' });
        return;
    }
    if (!decision_notes || !decision_notes.trim()) {
        res.status(400).json({ success: false, message: 'Informe a justificativa da decisão.' });
        return;
    }
    try {
        const [requestRows] = await db_1.default.execute('SELECT equipment_id, status FROM disposal_requests WHERE id = ?', [request_id]);
        if (requestRows.length === 0) {
            res.status(404).json({ success: false, message: 'Solicitação de descarte não encontrada.' });
            return;
        }
        if (requestRows[0].status !== 'Pendente') {
            res.status(409).json({ success: false, message: 'Esta solicitação já foi decidida.' });
            return;
        }
        const requestedEquipmentId = requestRows[0].equipment_id;
        await db_1.default.execute(`
            UPDATE disposal_requests 
            SET status = ?, decided_by_user_id = ?, decision_date = CURRENT_TIMESTAMP, decision_notes = ? 
            WHERE id = ?
        `, [status, userId, decision_notes.trim(), request_id]);
        const equipmentStatus = status === 'Autorizado' ? 'Descartado' : 'Funcionando parcialmente';
        await db_1.default.execute('UPDATE equipment SET status = ? WHERE id = ?', [equipmentStatus, requestedEquipmentId]);
        await (0, historyLogger_1.logAction)(userId, 'DECISÃO DE DESCARTE', 'equipment', Number(requestedEquipmentId), `Descarte ${status}.`);
        res.json({ success: true, message: `Descarte ${status} com sucesso!` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao processar decisão.' });
    }
};
exports.decideDisposal = decideDisposal;
const removeEquipmentAllocation = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const [equipmentRows] = await db_1.default.execute('SELECT id, client_company_id, status FROM equipment WHERE id = ?', [id]);
        if (equipmentRows.length === 0) {
            res.status(404).json({ success: false, message: 'Equipamento não encontrado.' });
            return;
        }
        await db_1.default.execute("UPDATE equipment SET client_company_id = NULL, status = CASE WHEN status = 'Descartado' THEN status ELSE 'Funcionando' END WHERE id = ?", [id]);
        if (userId)
            await (0, historyLogger_1.logAction)(userId, 'DESALOCAÇÃO DE EQUIPAMENTO', 'equipment', Number(id), 'Equipamento retirado da empresa cliente.');
        res.json({ success: true, message: 'Equipamento desalocado com sucesso!' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao desalocar equipamento.' });
    }
};
exports.removeEquipmentAllocation = removeEquipmentAllocation;
const removeEquipmentAllocations = async (req, res) => {
    const { equipment_ids, all, orphan } = req.body || {};
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
    }
    try {
        let query = all
            ? 'SELECT id FROM equipment'
            : 'SELECT id FROM equipment WHERE client_company_id IS NOT NULL';
        let params = [];
        if (!all) {
            if (!Array.isArray(equipment_ids) || equipment_ids.length === 0) {
                res.status(400).json({ success: false, message: 'Selecione pelo menos um equipamento.' });
                return;
            }
            const placeholders = equipment_ids.map(() => '?').join(', ');
            query += ` AND id IN (${placeholders})`;
            params = equipment_ids;
        }
        const [equipmentRows] = await db_1.default.execute(query, params);
        if (equipmentRows.length === 0) {
            res.status(404).json({ success: false, message: 'Nenhum equipamento alocado foi encontrado.' });
            return;
        }
        const ids = equipmentRows.map((equipment) => equipment.id);
        const placeholders = ids.map(() => '?').join(', ');
        await db_1.default.execute(`UPDATE equipment SET client_company_id = NULL, status = CASE WHEN status = 'Descartado' THEN status ELSE 'Funcionando' END WHERE id IN (${placeholders})`, ids);
        if (userId) {
            await (0, historyLogger_1.logAction)(userId, 'DESALOCAÇÃO DE EQUIPAMENTOS', 'equipment', Number(ids[0]), `${ids.length} equipamento(s) desalocado(s)${orphan ? ' e deixado(s) órfão(s)' : ''}.`);
        }
        res.json({ success: true, message: `${ids.length} equipamento(s) desalocado(s) com sucesso!` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao desalocar equipamentos.' });
    }
};
exports.removeEquipmentAllocations = removeEquipmentAllocations;
const getPeopleAllocations = async (req, res) => {
    try {
        const [allocations] = await db_1.default.execute(`
            SELECT
                a.id,
                a.professional_id,
                a.client_company_id as company_id,
                u.id as collaborator_id,
                u.name as professional_name,
                provider.id as provider_company_id,
                provider.name as provider_company_name,
                c.name as company_name,
                a.start_date,
                a.end_date,
                COALESCE(a.status, 'ACTIVE') as status
            FROM allocations a
            JOIN professionals p ON a.professional_id = p.id
            JOIN users u ON p.user_id = u.id
            LEFT JOIN companies provider ON p.provider_company_id = provider.id
            LEFT JOIN companies c ON a.client_company_id = c.id
            WHERE a.status IS NULL
               OR UPPER(TRIM(a.status)) NOT IN ('FINISHED', 'ENCERRADO', 'INACTIVE', 'INATIVO')
            ORDER BY a.id DESC
        `);
        res.json({ success: true, data: allocations });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar alocações de colaboradores.' });
    }
};
exports.getPeopleAllocations = getPeopleAllocations;
const removeAllocations = async (req, res) => {
    const { allocation_ids, all } = req.body || {};
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
    }
    if (!all && (!Array.isArray(allocation_ids) || allocation_ids.length === 0)) {
        res.status(400).json({ success: false, message: 'Selecione pelo menos uma alocação.' });
        return;
    }
    try {
        let query = "SELECT id FROM allocations WHERE (status IS NULL OR UPPER(TRIM(status)) NOT IN ('FINISHED', 'ENCERRADO', 'INACTIVE', 'INATIVO'))";
        let params = [];
        if (!all) {
            query += ` AND id IN (${allocation_ids.map(() => '?').join(', ')})`;
            params = allocation_ids;
        }
        const [rows] = await db_1.default.execute(query, params);
        if (rows.length === 0) {
            res.status(404).json({ success: false, message: 'Nenhuma alocação ativa encontrada.' });
            return;
        }
        const ids = rows.map((row) => row.id);
        const placeholders = ids.map(() => '?').join(', ');
        await db_1.default.execute(`UPDATE allocations SET status = 'FINISHED', end_date = CURDATE() WHERE id IN (${placeholders})`, ids);
        await (0, historyLogger_1.logAction)(userId, 'DESALOCAÇÃO DE COLABORADORES', 'allocations', Number(ids[0]), `${ids.length} vínculo(s) encerrado(s).`);
        res.json({ success: true, message: `${ids.length} vínculo(s) encerrado(s) com sucesso!` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao desalocar colaboradores.' });
    }
};
exports.removeAllocations = removeAllocations;
const removeProfessionalCompanies = async (req, res) => {
    const { professional_ids, all } = req.body || {};
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Não autorizado' });
        return;
    }
    if (!all && (!Array.isArray(professional_ids) || professional_ids.length === 0)) {
        res.status(400).json({ success: false, message: 'Selecione pelo menos um profissional.' });
        return;
    }
    try {
        let query = 'SELECT id FROM professionals WHERE provider_company_id IS NOT NULL';
        let params = [];
        if (!all) {
            query += ` AND id IN (${professional_ids.map(() => '?').join(', ')})`;
            params = professional_ids;
        }
        const [rows] = await db_1.default.execute(query, params);
        if (rows.length === 0) {
            res.status(404).json({ success: false, message: 'Nenhum vínculo com empresa prestadora foi encontrado.' });
            return;
        }
        const ids = rows.map((row) => row.id);
        const placeholders = ids.map(() => '?').join(', ');
        await db_1.default.execute(`UPDATE professionals SET provider_company_id = NULL WHERE id IN (${placeholders})`, ids);
        await (0, historyLogger_1.logAction)(userId, 'DESVINCULAÇÃO DE PRESTADORAS', 'professionals', Number(ids[0]), `${ids.length} vínculo(s) com prestadora encerrado(s).`);
        res.json({ success: true, message: `${ids.length} vínculo(s) com prestadora encerrado(s) com sucesso!` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao desvincular profissionais da prestadora.' });
    }
};
exports.removeProfessionalCompanies = removeProfessionalCompanies;
//# sourceMappingURL=adminController.js.map