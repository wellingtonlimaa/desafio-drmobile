import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { AppError } from '../errors/AppError';

const errosDeDuplicidade: Record<string, { code: string; message: string }> = {
    cpf: { code: 'CPF_ALREADY_EXISTS', message: 'Já existe um cliente cadastrado com este CPF.' },
    email: { code: 'EMAIL_ALREADY_EXISTS', message: 'Já existe um cliente cadastrado com este e-mail.' },
};

// Middleware central de erros: toda resposta de erro da API sai daqui, no formato { error, message, details? }
export const errorHandler = (error: unknown, req: Request, res: Response, next: NextFunction): void => {
    // erros de negócio lançados pela própria aplicação
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            error: error.code,
            message: error.message,
            ...(error.details && { details: error.details }),
        });
        return;
    }

    // corpo da requisição com JSON malformado
    if (error instanceof SyntaxError && 'body' in error) {
        res.status(httpStatus.BAD_REQUEST).json({
            error: 'INVALID_JSON',
            message: 'O corpo da requisição não é um JSON válido.',
        });
        return;
    }

    // erros de validação do Mongoose (campos obrigatórios, formatos, regras de negócio do schema)
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(httpStatus.BAD_REQUEST).json({
            error: 'VALIDATION_ERROR',
            message: 'Existem campos inválidos na requisição.',
            details: Object.values(error.errors).map((detalhe) => ({
                field: detalhe.path,
                message: detalhe.message,
            })),
        });
        return;
    }

    // id com formato inválido para ObjectId
    if (error instanceof mongoose.Error.CastError) {
        res.status(httpStatus.BAD_REQUEST).json({
            error: 'INVALID_ID',
            message: 'O identificador informado não é válido.',
        });
        return;
    }

    // violação de índice único (CPF ou e-mail duplicado)
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
        const campo = Object.keys(error.keyPattern ?? {})[0];
        const duplicado = errosDeDuplicidade[campo] ?? {
            code: 'DUPLICATE_VALUE',
            message: `Já existe um cliente com este valor de ${campo}.`,
        };
        res.status(httpStatus.CONFLICT).json({ error: duplicado.code, message: duplicado.message });
        return;
    }

    // qualquer outro erro: loga internamente e nunca expõe detalhes ao consumidor da API
    console.error('Erro não tratado:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Ocorreu um erro interno ao processar a solicitação.',
    });
};