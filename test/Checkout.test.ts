import Sinon from "sinon";
import Checkout from "../src/Checkout";
import CurrencyGateway from "../src/CurrencyGateway";
import CurrencyGatewayHttp from "../src/CurrencyGatewayHttp";
import ProductRepositoryDatabase from "../src/ProductRepositoryDatabase";
import CoupomRepositoryDatabase from "../src/CoupomRepositoryDatabase";

let checkout: Checkout;
beforeEach(() => {
    checkout = new Checkout();
});

test("Não deve aceitar um pedido com cpf inválido", async () => {
    type Input = {
        cpf: string;
        items: { id_product: number; quantity: number }[];
        coupon?: string;
        from?: string;
        to?: string;
    };
    const input: Input = {
        cpf: "111.111.111-11",
        items: [],
    };
    expect(() => checkout.execute(input)).rejects.toThrow(
        new Error("Invalid cpf.")
    );
});

test("Deve criar um pedido vazio com cpf válido", async () => {
    const input = {
        cpf: "791.910.400-94",
        items: [],
    };
    const output = await checkout.execute(input);
    expect(output.total).toBe(0);
});

test("Deve criar um pedido com 3 produtos", async () => {
    const input = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: 1 },
            { id_product: 2, quantity: 1 },
            { id_product: 3, quantity: 3 },
        ],
    };
    const output = await checkout.execute(input);
    expect(output.total).toBe(3090);
});

test("Deve criar um pedido com 3 produtos e um cupom de desconto", async () => {
    const input = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: 1 },
            { id_product: 2, quantity: 1 },
            { id_product: 3, quantity: 3 },
        ],
        coupon: "CODE10",
    };
    const output = await checkout.execute(input);
    expect(output.total).toBe(2781);
});

test("Deve criar um pedido com 3 produtos e um cupom de desconto inválido/vencido", async () => {
    const input = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: 1 },
            { id_product: 2, quantity: 1 },
            { id_product: 3, quantity: 3 },
        ],
        coupon: "CODE20",
    };
    const output = await checkout.execute(input);
    expect(output.total).toBe(3090);
});

test("Não deve criar um pedido com quantidade negativa.", async () => {
    const input = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: -1 },
            { id_product: 2, quantity: 1 },
            { id_product: 3, quantity: 3 },
        ],
    };
    expect(() => checkout.execute(input)).rejects.toThrow(
        new Error("Invalid quantity.")
    );
});

test("Não deve criar um pedido com item duplicado.", async () => {
    const input = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: 1 },
            { id_product: 2, quantity: 1 },
            { id_product: 2, quantity: 1 },
        ],
    };
    expect(() => checkout.execute(input)).rejects.toThrow(
        new Error("Duplicated item.")
    );
});

test("Deve criar um pedido com 1 produto e calcular o frete", async () => {
    const input = {
        cpf: "791.910.400-94",
        items: [{ id_product: 1, quantity: 2 }],
        from: "89227210",
        to: "12345678",
    };
    const output = await checkout.execute(input);
    expect(output.freight).toBe(40);
    expect(output.total).toBe(2040);
});

test("Não deve criar um pedido se um produto tiver dimensão negativa.", async () => {
    const input = {
        cpf: "791.910.400-94",
        items: [{ id_product: 4, quantity: 1 }],
    };
    expect(() => checkout.execute(input)).rejects.toThrow(
        new Error("Invalid dimension.")
    );
});

test("Deve criar um pedido com 1 produto e calcular o frete", async () => {
    const input = {
        cpf: "791.910.400-94",
        items: [{ id_product: 3, quantity: 1 }],
        from: "89227210",
        to: "12345678",
    };
    const output = await checkout.execute(input);
    expect(output.freight).toBe(10);
    expect(output.total).toBe(40);
});

test("Deve criar um pedido com 1 produto e em dólar com stub", async () => {
    const stubCurrencyGateway = Sinon.stub(
        CurrencyGatewayHttp.prototype,
        "getCurrencies"
    ).resolves({ usd: 3 });

    const stubProductRepository = Sinon.stub(
        ProductRepositoryDatabase.prototype,
        "getProduct"
    ).resolves({
        id_product: 6,
        description: "F",
        price: 1001.0,
        width: 100.0,
        height: 50.0,
        length: 50.0,
        weight: 2.0,
        currency: "USD",
    });

    const input = {
        cpf: "791.910.400-94",
        items: [{ id_product: 5, quantity: 1 }],
    };
    const output = await checkout.execute(input);
    expect(output.total).toBe(3003);
    stubCurrencyGateway.restore();
    stubProductRepository.restore();
});

test("Deve criar um pedido com 3 produtos e um cupom de desconto usando SPY", async () => {
    const spyCouponRepository = Sinon.spy(
        CoupomRepositoryDatabase.prototype,
        "getCoupom"
    );
    const spyProductRepository = Sinon.spy(
        ProductRepositoryDatabase.prototype,
        "getProduct"
    );
    const input = {
        cpf: "791.910.400-94",
        items: [
            { id_product: 1, quantity: 1 },
            { id_product: 2, quantity: 1 },
            { id_product: 3, quantity: 3 },
        ],
        coupon: "CODE10",
    };
    const output = await checkout.execute(input);
    expect(spyCouponRepository.calledOnce).toBeTruthy();
    expect(spyCouponRepository.calledWith("CODE10")).toBeTruthy();
    expect(spyProductRepository.calledThrice).toBeTruthy();
    expect(output.total).toBe(2781);
    spyCouponRepository.restore();
    spyProductRepository.restore();
});

test("Deve criar um pedido com 1 produto e em dólar com fake", async () => {
    const currencyGateway: CurrencyGateway = {
        async getCurrencies(): Promise<any> {
            return {
                usd: 5.5,
            };
        },
    };

    const input = {
        cpf: "791.910.400-94",
        items: [{ id_product: 5, quantity: 1 }],
    };
    const checkout = new Checkout(currencyGateway);
    const output = await checkout.execute(input);
    expect(output.total).toBe(5500);
});
