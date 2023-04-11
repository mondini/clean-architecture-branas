import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

app.get("/currencies", async (req: Request, res: Response) => {
    try {
        const currency = {
            usd: 3 + Math.random(),
        };
        res.json(currency);
    } catch (e: any) {
        res.status(422).json({ message: e.message });
    }
});

app.listen(8081, () => {
    console.log("Server listening on port 8081");
});
