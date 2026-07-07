import Cliente, { ICliente } from '../models/clientes';

// Camada de acesso a dados: concentra toda a interação com o Mongoose.
// O service não conhece detalhes do banco (operadores, skip/limit, regex) —
// fala apenas com estas funções, o que facilita testes e uma eventual troca de ODM.

export interface FiltroClientes {
    ativo?: boolean;
    nome?: string;
}

// escapa caracteres especiais para usar o valor digitado pelo usuário com segurança dentro de uma regex
const escaparRegex = (texto: string): string => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// traduz os filtros de domínio para a query do MongoDB
const montarFiltro = ({ ativo, nome }: FiltroClientes): Record<string, unknown> => {
    const filtro: Record<string, unknown> = {};
    if (ativo !== undefined) filtro.ativo = ativo;
    if (nome) filtro.nome = { $regex: escaparRegex(nome), $options: 'i' }; // busca sem diferenciar maiúsculas/minúsculas
    return filtro;
};

export const criar = (dados: Partial<ICliente>) => {
    return Cliente.create(dados);
};

export const contarEBuscar = async (filtro: FiltroClientes, skip: number, limit: number) => {
    const query = montarFiltro(filtro);
    const [total, data] = await Promise.all([
        Cliente.countDocuments(query),
        Cliente.find(query).skip(skip).limit(limit),
    ]);
    return { total, data };
};

export const buscarPorId = (id: string) => {
    return Cliente.findById(id);
};

export const atualizarPorId = (id: string, dados: Partial<ICliente>) => {
    return Cliente.findByIdAndUpdate(id, dados, {
        new: true,
        runValidators: true,
    });
};

export const excluirPorId = (id: string) => {
    return Cliente.findByIdAndDelete(id);
};
