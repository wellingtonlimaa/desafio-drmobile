function validarCPF(cpf: string): boolean {
    cpf = String(cpf).replace(/\D/g, '');

    // precisa ter exatamente 11 dígitos
    if (cpf.length !== 11) return false;

    // rejeita CPFs com todos os dígitos iguais.
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // valida o 1º dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf[i]) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto >= 10) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    // valida o 2º dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf[i]) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto >= 10) resto = 0;
    if (resto !== parseInt(cpf[10])) return false;

    return true;
}

export default validarCPF;