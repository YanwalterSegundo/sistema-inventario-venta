import type { Category, Customer, Product, Sale, Summary, User } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

type LoginResponse = {
  token: string;
  user: User;
};

async function request<T>(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "No se pudo completar la solicitud");
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export const api = {
  login(email: string, password: string) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  getSummary() {
    return request<Summary>("/reports/summary");
  },
  getCategories() {
    return request<Category[]>("/categories");
  },
  createCategory(name: string) {
    return request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify({ name })
    });
  },
  getProducts() {
    return request<Product[]>("/products");
  },
  createProduct(product: {
    name: string;
    sku: string;
    price: number;
    stock: number;
    minStock: number;
    categoryId: number;
  }) {
    return request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product)
    });
  },
  deleteProduct(id: number) {
    return request<null>(`/products/${id}`, { method: "DELETE" });
  },
  getCustomers() {
    return request<Customer[]>("/customers");
  },
  createCustomer(customer: {
    name: string;
    document?: string;
    phone?: string;
    email?: string;
  }) {
    return request<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(customer)
    });
  },
  getSales() {
    return request<Sale[]>("/sales");
  },
  createSale(payload: {
    customerId?: number | null;
    items: Array<{ productId: number; quantity: number }>;
  }) {
    return request<Sale>("/sales", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
