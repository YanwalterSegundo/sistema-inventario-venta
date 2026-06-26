export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SELLER";
};

export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  active: boolean;
  categoryId: number;
  category: Category;
};

export type Customer = {
  id: number;
  name: string;
  document?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type SaleItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product;
};

export type Sale = {
  id: number;
  code: string;
  total: number;
  status: "COMPLETED" | "CANCELLED";
  customer?: Customer | null;
  items: SaleItem[];
  createdAt: string;
};

export type Summary = {
  totalRevenue: number;
  monthRevenue: number;
  salesCount: number;
  productCount: number;
  customerCount: number;
  lowStockProducts: Product[];
  recentSales: Sale[];
};
