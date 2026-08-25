"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const db_1 = __importDefault(require("../database/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db_1.default.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
        if (!user) {
            res.status(401).json({ success: false, message: 'Credenciais inválidas' });
            return;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ success: false, message: 'Credenciais inválidas' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
        // Registra o login no histórico
        const queryHistory = `INSERT INTO history (user_id, action, entity_affected, entity_id, description) VALUES (?, ?, ?, ?, ?)`;
        await db_1.default.execute(queryHistory, [user.id, 'LOGIN', 'users', user.id, 'Usuário realizou login no sistema']);
        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor' });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map