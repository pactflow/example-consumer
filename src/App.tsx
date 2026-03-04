import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "spectre.css/dist/spectre.min.css";
import "spectre.css/dist/spectre-icons.min.css";
import "spectre.css/dist/spectre-exp.min.css";
import API from "./api";
import Heading from "./Heading";
import Layout from "./Layout";
import type { Product } from "./product";

interface ProductTableRowProps {
  product: Product;
}

function ProductTableRow({ product }: ProductTableRowProps) {
  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.type}</td>
      <td>
        <Link className="btn btn-link" to={`/products/${product.id}`}>
          See more!
        </Link>
      </td>
    </tr>
  );
}

interface ProductTableProps {
  products: Product[];
}

function ProductTable({ products }: ProductTableProps) {
  const rows = products.map((p) => <ProductTableRow key={p.id} product={p} />);
  return (
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th />
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    API.getAllProducts()
      .then((r) => {
        setProducts(r);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, []);

  const visibleProducts = useMemo(() => {
    if (!searchText) return products;
    const search = searchText.toLowerCase();
    return products.filter(
      (p) =>
        p.id.toLowerCase().includes(search) ||
        p.name.toLowerCase().includes(search) ||
        p.type.toLowerCase().includes(search)
    );
  }, [products, searchText]);

  if (error) {
    throw new Error("unable to fetch product data");
  }

  return (
    <Layout>
      <Heading text="Products" href="/" />
      <div className="form-group col-2">
        <label className="form-label" htmlFor="input-product-search">
          Search
        </label>
        <input
          id="input-product-search"
          className="form-input"
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="loading loading-lg centered" />
      ) : (
        <ProductTable products={visibleProducts} />
      )}
    </Layout>
  );
}
