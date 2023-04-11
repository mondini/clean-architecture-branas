import { validate } from "./validate";
import mysql, { RowDataPacket } from "mysql2";
import moment from "moment";
import ProductRepositoryDatabase from "./ProductRepositoryDatabase";
import CoupomRepositoryDatabase from "./CoupomRepositoryDatabase";
import axios from "axios";
import CurrencyGatewayHttp from "./CurrencyGatewayHttp";
import currencyGateway from "./CurrencyGateway";
import CurrencyGateway from "./CurrencyGateway";

type Item = {
    id_product: number;
    quantity: number;
};
type Input = {
    cpf: string;
    items: Item[];
    coupon?: string;
    from?: string;
    to?: string;
};
type Output = {
    total: number;
    freight: number;
};

export default class Checkout {
    constructor(
        readonly currencyGateway: CurrencyGateway = new CurrencyGatewayHttp()
    ) {}

    async execute(input: Input): Promise<Output> {
        const output: Output = {
            total: 0,
            freight: 0,
        };
        const cpfIsValid = validate(input.cpf);
        if (!cpfIsValid) throw new Error("Invalid cpf.");
        let items: number[] = [];
        if (input.items) {
            for (const item of input.items) {
                if (item.quantity <= 0) throw new Error("Invalid quantity.");
                if (items.includes(item.id_product))
                    throw new Error("Duplicated item.");

                const productRepository = new ProductRepositoryDatabase();
                const productData = await productRepository.getProduct(
                    item.id_product
                );
                if (productData) {
                    const currencies =
                        await this.currencyGateway.getCurrencies();
                    if (productData.currency == "USD") {
                        output.total +=
                            productData.price * item.quantity * currencies.usd;
                    } else {
                        output.total += productData.price * item.quantity;
                    }
                    if (
                        productData.width < 0 ||
                        productData.height < 0 ||
                        productData.length < 0 ||
                        productData.weight < 0
                    )
                        throw new Error("Invalid dimension.");
                    const volume =
                        (productData.width / 100) *
                        (productData.height / 100) *
                        (productData.length / 100);
                    const density = productData.weight / volume;
                    const itemFreight = 1000 * volume * (density / 100);
                    output.freight += Math.max(itemFreight, 10) * item.quantity;
                    items.push(productData.id_product);
                }
            }
            if (input.coupon) {
                const couponRepository = new CoupomRepositoryDatabase();
                const couponData = await couponRepository.getCoupom(
                    input.coupon
                );
                if (
                    couponData &&
                    moment().format("YYYY-MM-DD HH:mm:ss") <
                        moment(couponData.expired_date).format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                ) {
                    output.total -=
                        (output.total * couponData.percentage) / 100;
                }
            }
        }
        if (input.to && input.from) {
            output.total += output.freight;
        }
        return output;
    }
}
