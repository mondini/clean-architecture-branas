import mysql, { RowDataPacket } from "mysql2";

export default class CoupomRepositoryDatabase {
    async getCoupom(code: string): Promise<any> {
        const dbConnection = mysql.createConnection({
            host: "localhost",
            user: "user",
            password: "password",
            database: "db",
        });
        const couponData = await new Promise<RowDataPacket>(
            (resolve, reject) => {
                dbConnection.query(
                    "SELECT * FROM coupon WHERE code = ?",
                    [code],
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
        return couponData[0];
    }
}
