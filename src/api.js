const axios = require("axios").default;
const { Product } = require("./product");
axios.defaults.headers.common["Accept"] = "application/json; charset=utf-8";

export class API {
  constructor(url) {
    if (url === undefined || url === "") {
      url = process.env.REACT_APP_API_BASE_URL;
    }
    if (url.endsWith("/")) {
      url = url.substr(0, url.length - 1);
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
      .get(this.withPath("/products"), {
        headers: {
          Authorization: this.generateAuthToken(),
        },
      })
      .then((r) => r.data.map((p) => new Product(p)));
  }

  async getProduct(id) {
    return axios
      .get(this.withPath("/product/" + id), {
        headers: {
          Authorization: this.generateAuthToken(),
        },
      })
      .then((r) => new Product(r.data));
  }
}
