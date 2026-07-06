import express, { Request, Response } from 'express';
import customerRoutes from './routes/customerRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json()); // permite ler JSON no corpo das requisições

app.get('/', (req: Request, res: Response) => {
    res.json({ mensagem: 'API de Clientes rodando 🚀' });
});

app.use('/clientes', customerRoutes); // ativa as rotas de clientes

// rotas não mapeadas
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'ROUTE_NOT_FOUND', message: 'Rota não encontrada.' });
});

// middleware central de erros — precisa ser o último registrado
app.use(errorHandler);

export default app;