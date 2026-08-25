"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
// Importação das rotas (Serão criadas na Etapa 2)
// import apiRoutes from './routes';
const app = (0, express_1.default)();
// Middlewares Globais
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Servir arquivos estáticos do Frontend
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Rotas da API
app.use('/api', routes_1.default);
// Tratamento de rotas inexistentes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Rota não encontrada' });
});
// Middleware de tratamento global de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map