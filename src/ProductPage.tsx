import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "spectre.css/dist/spectre.min.css";
import "spectre.css/dist/spectre-icons.min.css";
import "spectre.css/dist/spectre-exp.min.css";
import API from "./api";
import Heading from "./Heading";
import Layout from "./Layout";
import type { Product } from "./product";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setProduct(null);
    API.getProduct(id)
      .then((r) => {
        setProduct(r);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [id]);

  if (error) {
    throw new Error("unable to fetch product data");
  }

  const productInfo = product ? (
    <div>
      <p>ID: {product.id}</p>
      <p>Name: {product.name}</p>
      <p>Type: {product.type}</p>
    </div>
  ) : null;

  return (
    <Layout>
      <Heading text="Products" href="/" />
      {loading ? (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="loading loading-lg"
        />
      ) : (
        productInfo
      )}
    </Layout>
  );
}
