import axios from "axios";
import { Product } from "./product";

export class API {
  constructor(url) {
    if (url === undefined || url === "") {
      url = process.env.REACT_APP_API_BASE_URL;
    }
    if (url.endsWith("/")) {
      url = url.substring(0, url.length - 1);
    }
    this.url = url;
  }

  withPath(path) {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    return `${this.url}${path}`;
  }

  generateAuthToken() {
    return "Bearer " + new Date().toISOString();
  }

  async getAllProducts() {
    return axios
      .get(this.withPath(`/products`), {
        headers: {
          Authorization: this.generateAuthToken(),
        },
      })
      .then(function (r) {
        return r.data.map((p) => new Product(p));
      })
      .catch((err) => {
        return { error: err.message };
      });
  }

  async getProduct(id) {
    return axios
      .get(this.withPath(`/product/${id}`), {
        headers: {
          Authorization: this.generateAuthToken(),
        },
      })
      .then((r) => {
        return new Product(r.data);
      })
      .catch((err) => {
        return { error: err.message, status: err.status };
      });
  }

  async keywordSearch(term) {
    return axios
      .get(this.withPath(`/keywordSearch/` + term), {
        headers: {
          Authorization: this.generateAuthToken(),
        },
      })
      .then((r) => {
        return r.data.map((p) => new Product(p));
      })
      .catch((err) => {
        return { error: err.message };
      });
  }
}

export default new API(
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
);
