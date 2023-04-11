import { validate } from "../src/validate";

test.each(["791.910.400-94", "328.260.150-60", "863.726.770-08"])(
    "Deve testar um CPF válido",
    (cpf) => {
        const isValid = validate(cpf);
        expect(isValid).toBeTruthy();
    }
);

test.each([
    "291.910.400-94",
    "368.260.150-60",
    "863.726.770-00",
    "863.726.770-0012355",
    "863",
])("Deve testar um CPF inválido", (cpf) => {
    const isValid = validate(cpf);
    expect(isValid).toBeFalsy();
});

test.each(["111.111.111-11", "000.000.000-00"])(
    "Deve testar um CPF inválido com digitos iguais",
    () => {
        const isValid = validate("111.111.111-11");
        expect(isValid).toBeFalsy();
    }
);
