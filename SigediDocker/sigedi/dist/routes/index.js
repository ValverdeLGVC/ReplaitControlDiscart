"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const db_1 = __importDefault(require("../database/db"));
const adminController = __importStar(require("../controllers/adminController"));
const authController = __importStar(require("../controllers/authController"));
const dashboardController = __importStar(require("../controllers/dashboardController"));
const disposalController = __importStar(require("../controllers/disposalController"));
const equipmentController = __importStar(require("../controllers/equipmentController"));
const historyController = __importStar(require("../controllers/historyController"));
const router = (0, express_1.Router)();
// ==========================================
// ROTAS PÚBLICAS (Sem exigência de Token)
// ==========================================
router.post('/auth/login', authController.login);
// ==========================================
// ROTAS PROTEGIDAS (Exigem Token de Acesso)
// ==========================================
router.use(authMiddleware_1.authenticate);
// =================== DASHBOARD ===================
router.get('/dashboard', dashboardController.getDashboardStats);
router.get('/history', historyController.getHistory);
router.delete('/history/:id', historyController.deleteHistoryRecord);
router.delete('/history', historyController.clearAllHistory);
// =================== EMPRESAS ===================
router.get('/companies', async (req, res) => {
    try {
        const [companies] = await db_1.default.execute('SELECT * FROM companies');
        res.json({ success: true, data: companies });
    }
    catch (e) {
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
        const [categories] = await db_1.default.execute('SELECT * FROM categories');
        res.json({ success: true, data: categories });
    }
    catch (e) {
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
exports.default = router;
//# sourceMappingURL=index.js.map