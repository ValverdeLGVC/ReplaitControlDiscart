"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAction = void 0;
const db_1 = __importDefault(require("../database/db"));
const logAction = async (userId, action, entityAffected, entityId, description) => {
    try {
        const query = `
      INSERT INTO history (user_id, action, entity_affected, entity_id, description) 
      VALUES (?, ?, ?, ?, ?)
    `;
        await db_1.default.execute(query, [userId, action, entityAffected, entityId, description]);
    }
    catch (error) {
        console.error('Erro ao registrar histórico:', error);
    }
};
exports.logAction = logAction;
//# sourceMappingURL=historyLogger.js.map