import axios from "axios";

axios.defaults.validateStatus = () => {
    return true;
};

test("Não deve aceitar um pedido com cpf inválido", async () => {
    type CheckoutInput = {
        cpf: string;
    };
    const input: CheckoutInput = {
        cpf: "111.111.111-11",
    };
    const response = await axios.post("http://localhost:8080/checkout", input);
    const output = response.data;
    expect(response.status).toBe(422);
    expect(output.message).toBe("Invalid cpf.");
});

test("Deve criar um pedido vazio com cpf válido", async () => {
    type CheckoutInput = {
        cpf: string;
    };
    const input: CheckoutInput = {
        cpf: "791.910.400-94",
    };
    const response = await axios.post("http://localhost:8080/checkout", input);
    const output = response.data;
    expect(output.total).toBe(0);
});

test("Deve criar um pedido com 3 produtos", async () => {
    type CheckoutInput = {
        cpf: string;
        items: Object;
    };
    const input: CheckoutInput = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: 1 },
            { id_product: 2, quantity: 1 },
            { id_product: 3, quantity: 3 },
        ],
    };
    const response = await axios.post("http://localhost:8080/checkout", input);
    const output = response.data;
    expect(output.total).toBe(3090);
});

test("Deve criar um pedido com 3 produtos e um cupom de desconto", async () => {
    type CheckoutInput = {
        cpf: string;
        items?: Object;
        coupon?: string;
    };
    const input: CheckoutInput = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: 1 },
            { id_product: 2, quantity: 1 },
            { id_product: 3, quantity: 3 },
        ],
        coupon: "CODE10",
    };
    const response = await axios.post("http://localhost:8080/checkout", input);
    const output = response.data;
    expect(output.total).toBe(2781);
});

test("Deve criar um pedido com 3 produtos e um cupom de desconto inválido/vencido", async () => {
    type CheckoutInput = {
        cpf: string;
        items?: Object;
        coupon?: string;
    };
    const input: CheckoutInput = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: 1 },
            { id_product: 2, quantity: 1 },
            { id_product: 3, quantity: 3 },
        ],
        coupon: "CODE20",
    };
    const response = await axios.post("http://localhost:8080/checkout", input);
    const output = response.data;
    expect(output.total).toBe(3090);
});

test("Não deve criar um pedido com quantidade negativa.", async () => {
    type CheckoutInput = {
        cpf: string;
        items: Object;
    };
    const input: CheckoutInput = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: -1 },
            { id_product: 2, quantity: 1 },
            { id_product: 3, quantity: 3 },
        ],
    };
    const response = await axios.post("http://localhost:8080/checkout", input);
    const output = response.data;
    expect(response.status).toBe(422);
    expect(output.message).toBe("Invalid quantity.");
});

test("Não deve criar um pedido com item duplicado.", async () => {
    type CheckoutInput = {
        cpf: string;
        items: Object;
    };
    const input: CheckoutInput = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: 1 },
            { id_product: 2, quantity: 1 },
            { id_product: 2, quantity: 1 },
        ],
    };
    const response = await axios.post("http://localhost:8080/checkout", input);
    const output = response.data;
    expect(response.status).toBe(422);
    expect(output.message).toBe("Duplicated item.");
});

test("Deve criar um pedido com 1 produto e calcular o frete", async () => {
    type CheckoutInput = {
        cpf: string;
        items: Object;
        from: string;
        to: string;
    };
    const input: CheckoutInput = {
        cpf: "791.910.400-94",
        items: [{ id_product: 1, quantity: 2 }],
        from: "89227210",
        to: "12345678",
    };
    const response = await axios.post("http://localhost:8080/checkout", input);
    const output = response.data;
    expect(output.freight).toBe(40);
    expect(output.total).toBe(2040);
});

test("Não deve criar um pedido se um produto tiver dimensão negativa.", async () => {
    type CheckoutInput = {
        cpf: string;
        items: Object;
    };
    const input: CheckoutInput = {
        cpf: "791.910.400-94",
        items: [{ id_product: 4, quantity: 1 }],
    };
    const response = await axios.post("http://localhost:8080/checkout", input);
    const output = response.data;
    expect(response.status).toBe(422);
    expect(output.message).toBe("Invalid dimension.");
});

test("Deve criar um pedido com 1 produto e calcular o frete", async () => {
    type CheckoutInput = {
        cpf: string;
        items: Object;
        from: string;
        to: string;
    };
    const input: CheckoutInput = {
        cpf: "791.910.400-94",
        items: [{ id_product: 3, quantity: 1 }],
        from: "89227210",
        to: "12345678",
    };
    const response = await axios.post("http://localhost:8080/checkout", input);
    const output = response.data;
    expect(output.freight).toBe(10);
    expect(output.total).toBe(40);
});
