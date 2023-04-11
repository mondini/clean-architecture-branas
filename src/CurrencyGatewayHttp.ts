import axios from "axios";
import CurrencyGateway from "./CurrencyGateway";

export default class CurrencyGatewayHttp implements CurrencyGateway {
    async getCurrencies() {
        const response = await axios.get("http://localhost:8081/currencies");
        return response.data;
    }
}
