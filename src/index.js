import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import ProductPage from './ProductPage';
import SearchPage from './SearchPage';
import ErrorBoundary from './ErrorBoundary';

const routing = (
  <BrowserRouter history="">
    <div>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/products/">
            <Route path=":id" element={<ProductPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </div>
  </BrowserRouter>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(routing);
