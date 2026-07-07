// Especificação OpenAPI 3 da API. O Swagger UI (montado em /docs no app.ts)
// renderiza a documentação interativa a partir deste documento.
export const openApiDocument = {
    openapi: '3.0.3',
    info: {
        title: 'API de Clientes',
        version: '1.0.0',
        description:
            'API REST para cadastro e gerenciamento de clientes — desafio técnico. ' +
            'Aceita CPF, telefone e CEP com ou sem máscara e salva os dados normalizados. ' +
            'Todas as respostas de erro seguem o formato `{ error, message, details? }`.',
    },
    servers: [{ url: '/', description: 'Ambiente local' }],
    tags: [{ name: 'Clientes', description: 'CRUD de clientes' }],
    paths: {
        '/clientes': {
            post: {
                tags: ['Clientes'],
                summary: 'Cadastrar cliente',
                description:
                    'Cria um cliente. CPF, telefone e CEP podem vir com máscara; e-mail é salvo em minúsculas e o estado em maiúsculas.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ClienteInput' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Cliente criado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Cliente' },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ErroDeValidacao' },
                    '409': { $ref: '#/components/responses/Conflito' },
                    '500': { $ref: '#/components/responses/ErroInterno' },
                },
            },
            get: {
                tags: ['Clientes'],
                summary: 'Listar clientes',
                description: 'Listagem paginada, com filtros opcionais por status e por nome (busca parcial, sem diferenciar maiúsculas/minúsculas).',
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        schema: { type: 'integer', minimum: 1, default: 1 },
                        description: 'Página desejada',
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
                        description: 'Itens por página (máximo 100)',
                    },
                    {
                        name: 'ativo',
                        in: 'query',
                        schema: { type: 'boolean' },
                        description: 'Filtra por status do cliente',
                    },
                    {
                        name: 'nome',
                        in: 'query',
                        schema: { type: 'string' },
                        description: 'Busca parcial por nome (case-insensitive)',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Listagem paginada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ListaPaginada' },
                            },
                        },
                    },
                    '500': { $ref: '#/components/responses/ErroInterno' },
                },
            },
        },
        '/clientes/{id}': {
            parameters: [{ $ref: '#/components/parameters/IdDoCliente' }],
            get: {
                tags: ['Clientes'],
                summary: 'Consultar cliente por ID',
                responses: {
                    '200': {
                        description: 'Cliente encontrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Cliente' },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/IdInvalido' },
                    '404': { $ref: '#/components/responses/NaoEncontrado' },
                    '500': { $ref: '#/components/responses/ErroInterno' },
                },
            },
            put: {
                tags: ['Clientes'],
                summary: 'Atualizar cliente',
                description:
                    'Atualização parcial: apenas os campos enviados são alterados, com todas as validações reaplicadas. ' +
                    'O CPF não pode ser alterado — tentativa de mudança retorna 400 CPF_INVALID_UPDATE (reenviar o CPF atual é permitido e ignorado).',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ClienteUpdate' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Cliente atualizado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Cliente' },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ErroDeValidacaoOuCpf' },
                    '404': { $ref: '#/components/responses/NaoEncontrado' },
                    '409': { $ref: '#/components/responses/Conflito' },
                    '500': { $ref: '#/components/responses/ErroInterno' },
                },
            },
            patch: {
                tags: ['Clientes'],
                summary: 'Atualizar cliente (parcial)',
                description: 'Mesmo comportamento do PUT: atualização parcial com validações e CPF imutável.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ClienteUpdate' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Cliente atualizado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Cliente' },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ErroDeValidacaoOuCpf' },
                    '404': { $ref: '#/components/responses/NaoEncontrado' },
                    '409': { $ref: '#/components/responses/Conflito' },
                    '500': { $ref: '#/components/responses/ErroInterno' },
                },
            },
            delete: {
                tags: ['Clientes'],
                summary: 'Excluir cliente',
                description: 'Exclusão física: remove o documento definitivamente.',
                responses: {
                    '204': { description: 'Cliente excluído (sem corpo de resposta)' },
                    '400': { $ref: '#/components/responses/IdInvalido' },
                    '404': { $ref: '#/components/responses/NaoEncontrado' },
                    '500': { $ref: '#/components/responses/ErroInterno' },
                },
            },
        },
    },
    components: {
        parameters: {
            IdDoCliente: {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string', example: '6a4aa91b4bf2f5a0ba4c747b' },
                description: 'ObjectId do cliente (24 caracteres hexadecimais)',
            },
        },
        schemas: {
            Endereco: {
                type: 'object',
                required: ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'],
                properties: {
                    cep: { type: 'string', example: '01001-000', description: 'Aceito com ou sem máscara; salvo somente números' },
                    logradouro: { type: 'string', example: 'Praça da Sé' },
                    numero: { type: 'string', example: '100' },
                    complemento: { type: 'string', example: 'Apartamento 10' },
                    bairro: { type: 'string', example: 'Sé' },
                    cidade: { type: 'string', example: 'São Paulo' },
                    estado: { type: 'string', example: 'SP', description: 'Duas letras; salvo em maiúsculas' },
                },
            },
            ClienteInput: {
                type: 'object',
                required: ['nome', 'cpf', 'email', 'telefone', 'dataNascimento', 'endereco'],
                properties: {
                    nome: { type: 'string', minLength: 3, example: 'João da Silva' },
                    cpf: { type: 'string', example: '529.982.247-25', description: 'CPF válido; aceito com ou sem máscara; imutável após o cadastro' },
                    email: { type: 'string', format: 'email', example: 'joao@email.com' },
                    telefone: { type: 'string', example: '(11) 99999-9999', description: 'Entre 10 e 13 números, com DDD' },
                    dataNascimento: { type: 'string', format: 'date', example: '1995-05-10', description: 'Cliente deve ter pelo menos 18 anos' },
                    ativo: { type: 'boolean', default: true },
                    endereco: { $ref: '#/components/schemas/Endereco' },
                },
            },
            ClienteUpdate: {
                type: 'object',
                description: 'Todos os campos são opcionais; apenas os enviados são alterados. O CPF não pode ser alterado.',
                properties: {
                    nome: { type: 'string', minLength: 3, example: 'João Atualizado' },
                    email: { type: 'string', format: 'email', example: 'novo@email.com' },
                    telefone: { type: 'string', example: '(11) 98888-7777' },
                    dataNascimento: { type: 'string', format: 'date', example: '1995-05-10' },
                    ativo: { type: 'boolean' },
                    endereco: { $ref: '#/components/schemas/Endereco' },
                },
            },
            Cliente: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '6a4aa91b4bf2f5a0ba4c747b' },
                    nome: { type: 'string', example: 'João da Silva' },
                    cpf: { type: 'string', example: '52998224725' },
                    email: { type: 'string', example: 'joao@email.com' },
                    telefone: { type: 'string', example: '11999999999' },
                    dataNascimento: { type: 'string', format: 'date-time', example: '1995-05-10T00:00:00.000Z' },
                    ativo: { type: 'boolean', example: true },
                    endereco: { $ref: '#/components/schemas/Endereco' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            ListaPaginada: {
                type: 'object',
                properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    total: { type: 'integer', example: 42 },
                    totalPages: { type: 'integer', example: 5 },
                    data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Cliente' },
                    },
                },
            },
            Erro: {
                type: 'object',
                properties: {
                    error: { type: 'string', example: 'CUSTOMER_NOT_FOUND' },
                    message: { type: 'string', example: 'Cliente não encontrado.' },
                },
            },
            ErroValidacao: {
                type: 'object',
                properties: {
                    error: { type: 'string', example: 'VALIDATION_ERROR' },
                    message: { type: 'string', example: 'Existem campos inválidos na requisição.' },
                    details: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: { type: 'string', example: 'email' },
                                message: { type: 'string', example: 'Formato de e-mail inválido' },
                            },
                        },
                    },
                },
            },
        },
        responses: {
            ErroDeValidacao: {
                description: 'Erro de validação (VALIDATION_ERROR) ou JSON malformado (INVALID_JSON)',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErroValidacao' },
                    },
                },
            },
            ErroDeValidacaoOuCpf: {
                description: 'Erro de validação (VALIDATION_ERROR), tentativa de alterar o CPF (CPF_INVALID_UPDATE), id inválido (INVALID_ID) ou JSON malformado (INVALID_JSON)',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErroValidacao' },
                        examples: {
                            cpfImutavel: {
                                summary: 'Tentativa de alterar o CPF',
                                value: { error: 'CPF_INVALID_UPDATE', message: 'O CPF do cliente não pode ser alterado.' },
                            },
                            validacao: {
                                summary: 'Campo inválido',
                                value: {
                                    error: 'VALIDATION_ERROR',
                                    message: 'Existem campos inválidos na requisição.',
                                    details: [{ field: 'email', message: 'Formato de e-mail inválido' }],
                                },
                            },
                        },
                    },
                },
            },
            IdInvalido: {
                description: 'ID com formato inválido (INVALID_ID)',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Erro' },
                        example: { error: 'INVALID_ID', message: 'O identificador informado não é válido.' },
                    },
                },
            },
            NaoEncontrado: {
                description: 'Cliente não encontrado (CUSTOMER_NOT_FOUND)',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Erro' },
                        example: { error: 'CUSTOMER_NOT_FOUND', message: 'Cliente não encontrado.' },
                    },
                },
            },
            Conflito: {
                description: 'CPF ou e-mail já cadastrado (CPF_ALREADY_EXISTS / EMAIL_ALREADY_EXISTS)',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Erro' },
                        example: { error: 'CPF_ALREADY_EXISTS', message: 'Já existe um cliente cadastrado com este CPF.' },
                    },
                },
            },
            ErroInterno: {
                description: 'Falha interna não prevista (sem expor detalhes)',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Erro' },
                        example: { error: 'INTERNAL_SERVER_ERROR', message: 'Ocorreu um erro interno ao processar a solicitação.' },
                    },
                },
            },
        },
    },
};
