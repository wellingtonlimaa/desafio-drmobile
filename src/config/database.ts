import mongoose from 'mongoose';

const conectarBanco = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('A variável MONGODB_URI não está definida no .env');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB conectado com sucesso!');
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : String(error);
    console.error('❌ Erro ao conectar no MongoDB:', mensagem);
    process.exit(1);
  }
};

export default conectarBanco;