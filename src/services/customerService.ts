import Cliente, { ICliente } from '../models/clientes';
import { AppError } from '../errors/AppError';

export interface ListarClientesParams {
    page: number;
    limit: number;
    ativo?: boolean;
    nome?: string;
}

// escapa caracteres especiais para usar o valor digitado pelo usuário com segurança dentro de uma regex
const escaparRegex = (texto: string): string => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const criarCliente = async (dados: Partial<ICliente>) => {
    return Cliente.create(dados);
};

export const listarClientes = async ({ page, limit, ativo, nome }: ListarClientesParams) => {
    const filtro: Record<string, unknown> = {};
    if (ativo !== undefined) filtro.ativo = ativo;
    if (nome) filtro.nome = { $regex: escaparRegex(nome), $options: 'i' }; // busca sem diferenciar maiúsculas/minúsculas

    const [total, data] = await Promise.all([
        Cliente.countDocuments(filtro),
        Cliente.find(filtro).skip((page - 1) * limit).limit(limit),
    ]);

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data,
    };
};

export const buscarClientePorId = async (id: string) => {
    const cliente = await Cliente.findById(id);
    if (!cliente) {
        throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente não encontrado.');
    }
    return cliente;
};

export const atualizarCliente = async (id: string, dados: Partial<ICliente>) => {
    const cliente = await buscarClientePorId(id);

    // regra de negócio: o CPF não pode ser alterado após o cadastro
    if (dados.cpf !== undefined) {
        const cpfInformado = String(dados.cpf).replace(/\D/g, '');
        if (cpfInformado !== cliente.cpf) {
            throw new AppError(400, 'CPF_INVALID_UPDATE', 'O CPF do cliente não pode ser alterado.');
        }
        delete dados.cpf; // mesmo CPF atual: apenas ignora o campo
    }

    const atualizado = await Cliente.findByIdAndUpdate(id, dados, {
        new: true,
        runValidators: true,
    });
    if (!atualizado) {
        throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente não encontrado.');
    }
    return atualizado;
};

export const excluirCliente = async (id: string): Promise<void> => {
    const cliente = await Cliente.findByIdAndDelete(id);
    if (!cliente) {
        throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente não encontrado.');
    }
};