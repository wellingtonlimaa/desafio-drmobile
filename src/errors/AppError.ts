export interface ErrorDetail {
    field: string;
    message: string;
}

// Erro de negócio conhecido: carrega o status HTTP e o código padronizado da API
export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly code: string,
        message: string,
        public readonly details?: ErrorDetail[]
    ) {
        super(message);
        this.name = 'AppError';
    }
}