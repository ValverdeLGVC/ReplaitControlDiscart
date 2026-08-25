import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes';

// Importação das rotas (Serão criadas na Etapa 2)
// import apiRoutes from './routes';

const app: Application = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do Frontend
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
 app.use('/api', apiRoutes);

// Tratamento de rotas inexistentes
app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Middleware de tratamento global de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
    });
});

export default app;