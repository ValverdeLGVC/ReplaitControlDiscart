import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import pool from '../database/db';

import * as adminController from '../controllers/adminController';
import * as authController from '../controllers/authController';
import * as dashboardController from '../controllers/dashboardController';
import * as disposalController from '../controllers/disposalController';
import * as equipmentController from '../controllers/equipmentController';
import * as historyController from '../controllers/historyController';

const router = Router();

// ==========================================
// ROTAS PÚBLICAS (Sem exigência de Token)
// ==========================================
router.post('/auth/login', authController.login);

// ==========================================
// ROTAS PROTEGIDAS (Exigem Token de Acesso)
// ==========================================
router.use(authenticate);

// =================== DASHBOARD ===================
router.get('/dashboard', dashboardController.getDashboardStats);
router.get('/history', historyController.getHistory);
router.delete('/history/:id', historyController.deleteHistoryRecord);
router.delete('/history', historyController.clearAllHistory);

// =================== EMPRESAS ===================
router.get('/companies', async (req, res) => {
    try {
        const [companies]: any = await pool.execute('SELECT * FROM companies');
        res.json({ success: true, data: companies });
    } catch (e) { 
        res.status(500).json({ success: false, message: 'Erro ao listar empresas' }); 
    }
});
router.post('/companies', adminController.createCompany);
router.put('/companies/:id', adminController.updateCompany);
router.delete('/companies/:id', adminController.deleteCompany);
router.get('/companies/:id/overview', adminController.getCompanyOverview);

// =================== EQUIPAMENTOS ===================
router.get('/equipment', equipmentController.getEquipments);
router.post('/equipment', equipmentController.createEquipment);
router.put('/equipment/:id/relocate', equipmentController.relocateEquipment);
router.delete('/equipment/:id', equipmentController.deleteEquipment);

// =================== CATEGORIAS ===================
router.get('/categories', async (req, res) => {
    try {
        const [categories]: any = await pool.execute('SELECT * FROM categories');
        res.json({ success: true, data: categories });
    } catch (e) { 
        res.status(500).json({ success: false, message: 'Erro ao listar categorias' }); 
    }
});

// =================== PROFISSIONAIS E USUÁRIOS ===================
router.get('/professionals', adminController.getProfessionals);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateSupportUser);
router.delete('/users/:id', adminController.deleteSupportUser);

// =================== ALOCAÇÕES ===================
router.get('/allocations', adminController.getActiveAllocations);
router.get('/allocations/people', adminController.getPeopleAllocations);
router.post('/allocations', adminController.createAllocation);
router.put('/allocations/remove', adminController.removeAllocations);
router.put('/allocations/:id/remove', adminController.removeAllocation);
router.put('/professionals/unlink-company', adminController.removeProfessionalCompanies);
router.put('/equipment/unallocate', adminController.removeEquipmentAllocations);
router.put('/equipment/:id/unallocate', adminController.removeEquipmentAllocation);

// =================== DESCARTE ===================
router.post('/descarte/solicitar', disposalController.requestDisposal);
router.post('/descarte/decidir', adminController.decideDisposal); // Mantido o padrão original de nomenclatura se houver

export default router;