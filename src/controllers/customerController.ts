import { Request, Response } from 'express';
import * as customerService from '../services/customerService';

// No Express 5, promessas rejeitadas em handlers async são encaminhadas
// automaticamente ao middleware de erros — por isso não há try/catch aqui.

// converte e sanitiza os parâmetros de paginação e filtros da query string
const extrairParametrosDeListagem = (req: Request) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    let ativo: boolean | undefined;
    if (req.query.ativo === 'true') ativo = true;
    else if (req.query.ativo === 'false') ativo = false;

    const nome =
        typeof req.query.nome === 'string' && req.query.nome.trim() !== ''
            ? req.query.nome.trim()
            : undefined;

    return { page, limit, ativo, nome };
};

// CREATE - Cadastrar cliente
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
    const cliente = await customerService.criarCliente(req.body);
    res.status(201).json(cliente);
};

// READ - Consultar todos os clientes (com paginação e filtros)
export const listCustomer = async (req: Request, res: Response): Promise<void> => {
    const resultado = await customerService.listarClientes(extrairParametrosDeListagem(req));
    res.status(200).json(resultado);
};

// READ - Consultar cliente específico
export const getCustomer = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const cliente = await customerService.buscarClientePorId(req.params.id);
    res.status(200).json(cliente);
};

// UPDATE - Atualizar os dados de um cliente
export const updateCustomer = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const cliente = await customerService.atualizarCliente(req.params.id, req.body);
    res.status(200).json(cliente);
};

// DELETE - Excluir um cliente (exclusão física)
export const deleteCustomer = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    await customerService.excluirCliente(req.params.id);
    res.status(204).send();
};