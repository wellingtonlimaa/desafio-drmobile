import 'dotenv/config';
import app from './app';
import connectDatabase from './config/database';

const PORT = Number(process.env.PORT) || 3000;

const iniciar = async (): Promise<void> => {
    await connectDatabase(); // conecta no banco antes de aceitar requisições

    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
};

iniciar();