import axios from 'axios';
import adapter from "axios/lib/adapters/http";

axios.defaults.adapter = adapter;

exports.getAllProducts = async endpoint => {
  const url = endpoint.url
  const port = endpoint.port

  let api = await axios.request({
    method: "GET",
    baseURL: `${url}:${port}`,
    url: "/products",
    headers: { Accept: "application/json" },
  });

  return api;
  
}

exports.getProduct = async (endpoint, id) => {
  const url = endpoint.url
  const port = endpoint.port

  let api = await axios.request({
    method: "GET",
    baseURL: `${url}:${port}`,
    url: "/product/10",
    headers: { Accept: "application/json" },
  });

  return api;

}

/*
export class API {
  constructor(url) {
    if (url === undefined || url === "") {
      url = process.env.REACT_APP_API_BASE_URL;
    }
    if (url.endsWith("/")) {
      url = url.substr(0, url.length - 1)
    }
    this.url = url
  }

  withPath(path) {
    if (!path.startsWith("/")) {
      path = "/" + path
    }
    return `${this.url}${path}`
  }

  generateAuthToken() {
    return "Bearer " + new Date().toISOString()
  }

 async getAllProducts(path = "/products") {
    return axios.get(`${this.url}${path}`)
    .then(r => r.data);
  }

 async getProduct(id) {
    return axios.get(this.withPath("/product/" + id))
    .then(r => r.data);
  }
}

export default new API(process.env.REACT_APP_API_BASE_URL);

*/