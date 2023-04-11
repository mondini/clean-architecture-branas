export function validate(cpf: string) {
    if (!cpf) return false;
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    if (cpf.split("").every((c) => c === cpf[0])) return false;
    let d1 = 0;
    let d2 = 0;
    for (let nCount = 1; nCount < cpf.length - 1; nCount++) {
        let digito = parseInt(cpf.substring(nCount - 1, nCount));
        d1 = d1 + (11 - nCount) * digito;
        d2 = d2 + (12 - nCount) * digito;
    }
    let rest = d1 % 11;
    let dg1 = 0;
    dg1 = rest < 2 ? (dg1 = 0) : 11 - rest;
    d2 += 2 * dg1;
    rest = d2 % 11;
    let dg2 = rest < 2 ? 0 : 11 - rest;
    let digitoVerificado = cpf.substring(cpf.length - 2, cpf.length);
    let digitoResultado = "" + dg1 + "" + dg2;
    return digitoVerificado == digitoResultado;
}
