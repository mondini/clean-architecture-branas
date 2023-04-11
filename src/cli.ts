import Checkout from "./Checkout";

type Input = {
    cpf: string;
    items: { id_product: number; quantity: number }[];
    coupon?: string;
    from?: string;
    to?: string;
};
const input: Input = { cpf: "", items: [] };

process.stdin.on("data", async (chunk) => {
    const command = chunk.toString().replace(/\n/g, "");

    if (command.startsWith("set-cpf")) {
        input.cpf = command.replace("set-cpf ", "");
    }

    if (command.startsWith("set-item")) {
        const [id_product, quantity] = command
            .replace("set-item ", "")
            .split(" ");

        input.items.push({
            id_product: parseInt(id_product),
            quantity: parseInt(quantity),
        });
    }

    if (command.startsWith("checkout")) {
        try {
            const checkout = new Checkout();
            const output = await checkout.execute(input);
            console.log(output);
        } catch (e: any) {
            console.log(e.message);
        }
    }
});
