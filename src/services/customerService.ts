import httpStatus from 'http-status';
import { ICliente } from '../models/clientes';
import { AppError } from '../errors/AppError';
import * as customerRepository from '../repositories/customerRepository';

// Camada de regras de negócio: orquestra as operações e valida invariantes
// (CPF imutável, existência do cliente). O acesso ao banco fica no repository.

export interface ListarClientesParams {
    page: number;
    limit: number;
    ativo?: boolean;
    nome?: string;
}

export const criarCliente = async (dados: Partial<ICliente>) => {
    return customerRepository.criar(dados);
};

export const listarClientes = async ({ page, limit, ativo, nome }: ListarClientesParams) => {
    const { total, data } = await customerRepository.contarEBuscar(
        { ativo, nome },
        (page - 1) * limit,
        limit,
    );

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data,
    };
};

export const buscarClientePorId = async (id: string) => {
    const cliente = await customerRepository.buscarPorId(id);
    if (!cliente) {
        throw new AppError(httpStatus.NOT_FOUND, 'CUSTOMER_NOT_FOUND', 'Cliente não encontrado.');
    }
    return cliente;
};

export const atualizarCliente = async (id: string, dados: Partial<ICliente>) => {
    const cliente = await buscarClientePorId(id);

    // regra de negócio: o CPF não pode ser alterado após o cadastro
    if (dados.cpf !== undefined) {
        const cpfInformado = String(dados.cpf).replace(/\D/g, '');
        if (cpfInformado !== cliente.cpf) {
            throw new AppError(httpStatus.BAD_REQUEST, 'CPF_INVALID_UPDATE', 'O CPF do cliente não pode ser alterado.');
        }
        delete dados.cpf; // mesmo CPF atual: apenas ignora o campo
    }

    const atualizado = await customerRepository.atualizarPorId(id, dados);
    if (!atualizado) {
        throw new AppError(httpStatus.NOT_FOUND, 'CUSTOMER_NOT_FOUND', 'Cliente não encontrado.');
    }
    return atualizado;
};

export const excluirCliente = async (id: string): Promise<void> => {
    const cliente = await customerRepository.excluirPorId(id);
    if (!cliente) {
        throw new AppError(httpStatus.NOT_FOUND, 'CUSTOMER_NOT_FOUND', 'Cliente não encontrado.');
    }
};
