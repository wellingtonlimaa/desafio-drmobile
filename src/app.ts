import express, { Request, Response } from 'express';
import httpStatus from 'http-status';
import swaggerUi from 'swagger-ui-express';
import customerRoutes from './routes/customerRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { openApiDocument } from './docs/openapi';

const app = express();

app.use(express.json()); // permite ler JSON no corpo das requisições

app.get('/', (req: Request, res: Response) => {
    res.json({ mensagem: 'API de Clientes rodando 🚀' });
});

app.use('/clientes', customerRoutes); // ativa as rotas de clientes 

// documentação interativa (Swagger UI) e o contrato OpenAPI em JSON
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get('/docs.json', (req: Request, res: Response) => {
    res.json(openApiDocument);
});

// rotas não mapeadas
app.use((req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({ error: 'ROUTE_NOT_FOUND', message: 'Rota não encontrada.' });
});

// middleware central de erros — precisa ser o último registrado
app.use(errorHandler);

export default app;
