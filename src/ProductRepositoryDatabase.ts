import mysql, { RowDataPacket } from "mysql2";

export default class ProductRepositoryDatabase {
    async getProduct(idProduct: number): Promise<any> {
        const dbConnection = mysql.createConnection({
            host: "localhost",
            user: "user",
            password: "password",
            database: "db",
        });
        const productData = await new Promise<RowDataPacket>(
            (resolve, reject) => {
                dbConnection.query(
                    "SELECT * FROM products WHERE id_product = ?",
                    [idProduct],
                    (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result as RowDataPacket);
                        }
                    }
                );
            }
        );
        dbConnection.end();
        return productData[0];
    }
}
