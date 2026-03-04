import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import ProductPage from "./ProductPage";

const routing = (
  <BrowserRouter>
    <div>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/products/">
            <Route path=":id" element={<ProductPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </div>
  </BrowserRouter>
);

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");
const root = ReactDOM.createRoot(rootEl);
root.render(routing);
