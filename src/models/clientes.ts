import mongoose, { Schema } from 'mongoose';
import validarCPF from '../validators/validarCPF';

export interface IEndereco {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
}

export interface ICliente {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    dataNascimento: Date;
    ativo: boolean;
    endereco: IEndereco;
}

const clienteSchema = new Schema<ICliente>(
    {
        nome: {
            type: String,
            required: [true, 'O nome é obrigatório'],
            trim: true,
            minlength: [3, 'O nome deve ter pelo menos 3 caracteres'],
        },
        cpf: {
            type: String,
            required: [true, 'O cpf é obrigatório'],
            unique: true,
            trim: true,
            immutable: true,
            set: (valor: unknown) => String(valor).replace(/\D/g, ''),
            validate: [
                {
                    validator: (v: string) => v.length === 11,
                    message: 'O CPF deve conter exatamente 11 números'
                },
                {
                    validator: validarCPF,
                    message: 'CPF inválido'
                }
            ]
        },
        email: {
            type: String,
            required: [true, 'O e-mail é obrigatório'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de e-mail inválido'],
        },
        telefone: {
            type: String,
            required: [true, 'O telefone é obrigatório'],
            trim: true,
            set: (valor: unknown) => String(valor).replace(/\D/g, ''),
            validate: {
                validator: (v: string) => v.length >= 10 && v.length <= 13,
                message: 'O telefone deve conter entre 10 e 13 números (com DDD)'
            }
        },
        dataNascimento: {
            type: Date,
            required: [true, 'A data de nascimento é obrigatório'],
            validate: [
                // Data de hoje
                {
                    validator: (data: Date) => data <= new Date(),
                    message: 'A data de nascimento não pode ser uma data futura'
                },
                // cálculo de idade
                {
                    validator: function (data: Date) {
                        const hoje = new Date();
                        let idade = hoje.getFullYear() - data.getFullYear();
                        const mes = hoje.getMonth() - data.getMonth();
                        // ainda não fez aniversário este ano? tira 1 ano
                        if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
                            idade--;
                        }
                        return idade >= 18;
                    },
                    message: 'O cliente deve ter pelo menos 18 anos'
                }
            ]
        },
        ativo: {
            type: Boolean,
            default: true,
        },
        endereco: {
            cep: {
                type: String,
                required: [true, 'O CEP é obrigatório'],
                trim: true,
                set: (valor: unknown) => String(valor).replace(/\D/g, ''),
                validate: {
                    validator: (v: string) => v.length === 8,
                    message: 'O CEP deve conter exatamente 8 números'
                }
            },
            logradouro: {
                type: String,
                required: [true, 'O logradouro é obrigatório'],
                trim: true,
            },
            numero: {
                type: String,
                required: [true, 'O número é obrigatório'],
                trim: true,
            },
            complemento: {
                type: String,
                trim: true,
            },
            bairro: {
                type: String,
                required: [true, 'O bairro é obrigatório'],
                trim: true,
            },
            cidade: {
                type: String,
                required: [true, 'A cidade é obrigatória'],
                trim: true,
            },
            estado: {
                type: String,
                required: [true, 'o estado é obrigatório'],
                uppercase: true,
                trim: true,
                match: [/^[A-Z]{2}$/, 'O estado deve possuir exatamente duas letras'],
            }
        }
    },
    { timestamps: true }
);

export default mongoose.model<ICliente>('Cliente', clienteSchema);