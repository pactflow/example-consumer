import axios from "axios";
import { Product, type ProductData } from "./product";

export class API {
  private readonly baseURL: string;

  constructor(url?: string) {
    this.baseURL = url || "http://localhost:8080";
  }

  generateAuthToken(): string {
    return `Bearer ${new Date().toISOString()}`;
  }

  getAllProducts(): Promise<Product[]> {
    return axios
      .get<ProductData[]>("/products", {
        baseURL: this.baseURL,
        headers: {
          Authorization: this.generateAuthToken(),
        },
      })
      .then((r) => r.data.map((p) => new Product(p)));
  }

  getProduct(id: string): Promise<Product> {
    return axios
      .get<ProductData>(`/product/${id}`, {
        baseURL: this.baseURL,
        headers: {
          Authorization: this.generateAuthToken(),
        },
      })
      .then((r) => new Product(r.data));
  }
}

export default new API(import.meta.env.VITE_API_BASE_URL);
