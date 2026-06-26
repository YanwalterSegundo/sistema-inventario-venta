import {
  AlertTriangle,
  BarChart3,
  Boxes,
  LogOut,
  PackagePlus,
  Receipt,
  ShoppingCart,
  Users
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { Category, Customer, Product, Sale, Summary, User } from "./types";

type Tab = "dashboard" | "products" | "customers" | "sales";

type ProductForm = {
  name: string;
  sku: string;
  price: string;
  stock: string;
  minStock: string;
  categoryId: string;
};

type CustomerForm = {
  name: string;
  document: string;
  phone: string;
  email: string;
};

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN"
});

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "short",
  timeStyle: "short"
});

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    setIsLoading(true);
    setError("");

    try {
      const [summaryData, categoriesData, productsData, customersData, salesData] =
        await Promise.all([
          api.getSummary(),
          api.getCategories(),
          api.getProducts(),
          api.getCustomers(),
          api.getSales()
        ]);

      setSummary(summaryData);
      setCategories(categoriesData);
      setProducts(productsData);
      setCustomers(customersData);
      setSales(salesData);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      void loadData();
    }
  }, [token]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  if (!token || !user) {
    return (
      <LoginScreen
        onLogin={(loginToken, loginUser) => {
          localStorage.setItem("token", loginToken);
          localStorage.setItem("user", JSON.stringify(loginUser));
          setToken(loginToken);
          setUser(loginUser);
        }}
      />
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <Boxes aria-hidden="true" />
            <div>
              <strong>Inventario</strong>
              <span>Ventas</span>
            </div>
          </div>

          <nav className="nav">
            <NavButton icon={<BarChart3 />} label="Dashboard" tab="dashboard" activeTab={activeTab} onClick={setActiveTab} />
            <NavButton icon={<PackagePlus />} label="Productos" tab="products" activeTab={activeTab} onClick={setActiveTab} />
            <NavButton icon={<Users />} label="Clientes" tab="customers" activeTab={activeTab} onClick={setActiveTab} />
            <NavButton icon={<ShoppingCart />} label="Ventas" tab="sales" activeTab={activeTab} onClick={setActiveTab} />
          </nav>
        </div>

        <div className="sidebarFooter">
          <div className="userBox">
            <span>{user.name}</span>
            <small>{user.role}</small>
          </div>
          <button className="iconButton" type="button" onClick={handleLogout} title="Cerrar sesion">
            <LogOut aria-hidden="true" />
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p>{activeTabLabel(activeTab)}</p>
            <h1>Sistema de Inventario y Ventas</h1>
          </div>
          <button className="secondaryButton" type="button" onClick={loadData} disabled={isLoading}>
            Actualizar
          </button>
        </header>

        {error ? <div className="alert">{error}</div> : null}

        {activeTab === "dashboard" ? (
          <Dashboard summary={summary} isLoading={isLoading} />
        ) : null}

        {activeTab === "products" ? (
          <ProductsView
            categories={categories}
            products={products}
            onCreated={loadData}
            onDeleted={loadData}
          />
        ) : null}

        {activeTab === "customers" ? (
          <CustomersView customers={customers} onCreated={loadData} />
        ) : null}

        {activeTab === "sales" ? (
          <SalesView
            customers={customers}
            products={products}
            sales={sales}
            onCreated={loadData}
          />
        ) : null}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("Demo12345");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.login(email, password);
      onLogin(response.token, response.user);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "No se pudo iniciar sesion");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="loginPage">
      <section className="loginPanel">
        <div className="brand loginBrand">
          <Boxes aria-hidden="true" />
          <div>
            <strong>Inventario</strong>
            <span>Ventas</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="formStack">
          <label>
            Correo
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <div className="alert">{error}</div> : null}
          <button className="primaryButton" type="submit" disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}

function NavButton({
  icon,
  label,
  tab,
  activeTab,
  onClick
}: {
  icon: JSX.Element;
  label: string;
  tab: Tab;
  activeTab: Tab;
  onClick: (tab: Tab) => void;
}) {
  return (
    <button
      className={activeTab === tab ? "navButton active" : "navButton"}
      type="button"
      onClick={() => onClick(tab)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Dashboard({ summary, isLoading }: { summary: Summary | null; isLoading: boolean }) {
  if (isLoading && !summary) {
    return <div className="emptyState">Cargando informacion...</div>;
  }

  return (
    <section className="stack">
      <div className="metricsGrid">
        <MetricCard label="Ventas acumuladas" value={currency.format(summary?.totalRevenue ?? 0)} />
        <MetricCard label="Ventas del mes" value={currency.format(summary?.monthRevenue ?? 0)} />
        <MetricCard label="Productos activos" value={String(summary?.productCount ?? 0)} />
        <MetricCard label="Clientes" value={String(summary?.customerCount ?? 0)} />
      </div>

      <div className="twoColumns">
        <section className="panel">
          <div className="panelHeader">
            <h2>Stock bajo</h2>
            <AlertTriangle aria-hidden="true" />
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoria</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {summary?.lowStockProducts.length ? (
                  summary.lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category.name}</td>
                      <td>
                        <span className="badge warning">{product.stock}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>No hay productos con stock bajo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Ventas recientes</h2>
            <Receipt aria-hidden="true" />
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Cliente</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {summary?.recentSales.length ? (
                  summary.recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.code}</td>
                      <td>{sale.customer?.name ?? "Venta directa"}</td>
                      <td>{currency.format(sale.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>Aun no hay ventas registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="metricCard">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ProductsView({
  categories,
  products,
  onCreated,
  onDeleted
}: {
  categories: Category[];
  products: Product[];
  onCreated: () => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const [form, setForm] = useState<ProductForm>({
    name: "",
    sku: "",
    price: "",
    stock: "",
    minStock: "5",
    categoryId: ""
  });
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await api.createCategory(categoryName);
      setCategoryName("");
      await onCreated();
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "No se pudo crear la categoria");
    }
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await api.createProduct({
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        categoryId: Number(form.categoryId)
      });
      setForm({ name: "", sku: "", price: "", stock: "", minStock: "5", categoryId: "" });
      await onCreated();
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "No se pudo crear el producto");
    }
  }

  return (
    <section className="stack">
      {error ? <div className="alert">{error}</div> : null}

      <div className="twoColumns">
        <section className="panel">
          <div className="panelHeader">
            <h2>Nuevo producto</h2>
          </div>
          <form className="formGrid" onSubmit={handleCreateProduct}>
            <label>
              Nombre
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              SKU
              <input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
            </label>
            <label>
              Precio
              <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
            </label>
            <label>
              Stock
              <input type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
            </label>
            <label>
              Stock minimo
              <input type="number" min="0" value={form.minStock} onChange={(event) => setForm({ ...form, minStock: event.target.value })} />
            </label>
            <label>
              Categoria
              <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                <option value="">Seleccionar</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="primaryButton" type="submit">Guardar producto</button>
          </form>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Nueva categoria</h2>
          </div>
          <form className="formStack" onSubmit={handleCreateCategory}>
            <label>
              Nombre
              <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
            </label>
            <button className="secondaryButton" type="submit">Guardar categoria</button>
          </form>
        </section>
      </div>

      <section className="panel">
        <div className="panelHeader">
          <h2>Productos</h2>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.category.name}</td>
                  <td>{currency.format(product.price)}</td>
                  <td>
                    <span className={product.stock <= product.minStock ? "badge warning" : "badge"}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <button className="textButton" type="button" onClick={() => api.deleteProduct(product.id).then(onDeleted)}>
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function CustomersView({
  customers,
  onCreated
}: {
  customers: Customer[];
  onCreated: () => Promise<void>;
}) {
  const [form, setForm] = useState<CustomerForm>({
    name: "",
    document: "",
    phone: "",
    email: ""
  });
  const [error, setError] = useState("");

  async function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await api.createCustomer(form);
      setForm({ name: "", document: "", phone: "", email: "" });
      await onCreated();
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "No se pudo crear el cliente");
    }
  }

  return (
    <section className="stack">
      {error ? <div className="alert">{error}</div> : null}

      <section className="panel">
        <div className="panelHeader">
          <h2>Nuevo cliente</h2>
        </div>
        <form className="formGrid" onSubmit={handleCreateCustomer}>
          <label>
            Nombre
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            Documento
            <input value={form.document} onChange={(event) => setForm({ ...form, document: event.target.value })} />
          </label>
          <label>
            Telefono
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </label>
          <label>
            Correo
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <button className="primaryButton" type="submit">Guardar cliente</button>
        </form>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <h2>Clientes</h2>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Telefono</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.document ?? "-"}</td>
                  <td>{customer.phone ?? "-"}</td>
                  <td>{customer.email ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function SalesView({
  customers,
  products,
  sales,
  onCreated
}: {
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  onCreated: () => Promise<void>;
}) {
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [cart, setCart] = useState<Array<{ productId: number; quantity: number }>>([]);
  const [error, setError] = useState("");

  const cartDetails = useMemo(
    () =>
      cart.map((item) => {
        const product = products.find((currentProduct) => currentProduct.id === item.productId);
        return {
          ...item,
          product,
          subtotal: product ? product.price * item.quantity : 0
        };
      }),
    [cart, products]
  );

  const cartTotal = cartDetails.reduce((sum, item) => sum + item.subtotal, 0);

  function handleAddItem() {
    const selectedProductId = Number(productId);
    const selectedQuantity = Number(quantity);

    if (!selectedProductId || selectedQuantity <= 0) {
      setError("Selecciona un producto y una cantidad valida");
      return;
    }

    setError("");
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.productId === selectedProductId);

      if (existing) {
        return currentCart.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item
        );
      }

      return [...currentCart, { productId: selectedProductId, quantity: selectedQuantity }];
    });
    setProductId("");
    setQuantity("1");
  }

  async function handleCreateSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await api.createSale({
        customerId: customerId ? Number(customerId) : null,
        items: cart
      });
      setCustomerId("");
      setCart([]);
      await onCreated();
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "No se pudo registrar la venta");
    }
  }

  return (
    <section className="stack">
      {error ? <div className="alert">{error}</div> : null}

      <section className="panel">
        <div className="panelHeader">
          <h2>Nueva venta</h2>
        </div>
        <form className="formStack" onSubmit={handleCreateSale}>
          <div className="formGrid">
            <label>
              Cliente
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                <option value="">Venta directa</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Producto
              <select value={productId} onChange={(event) => setProductId(event.target.value)}>
                <option value="">Seleccionar</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - stock {product.stock}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cantidad
              <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            </label>
            <button className="secondaryButton" type="button" onClick={handleAddItem}>
              Agregar item
            </button>
          </div>

          <div className="cartBox">
            {cartDetails.length ? (
              cartDetails.map((item) => (
                <div key={item.productId} className="cartItem">
                  <span>{item.product?.name ?? "Producto"}</span>
                  <strong>
                    {item.quantity} x {currency.format(item.product?.price ?? 0)}
                  </strong>
                </div>
              ))
            ) : (
              <span>No hay productos agregados.</span>
            )}
            <div className="cartTotal">
              <span>Total</span>
              <strong>{currency.format(cartTotal)}</strong>
            </div>
          </div>

          <button className="primaryButton" type="submit" disabled={!cart.length}>
            Registrar venta
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <h2>Historial de ventas</h2>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.code}</td>
                  <td>{sale.customer?.name ?? "Venta directa"}</td>
                  <td>{dateFormatter.format(new Date(sale.createdAt))}</td>
                  <td>{currency.format(sale.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function activeTabLabel(tab: Tab) {
  const labels: Record<Tab, string> = {
    dashboard: "Resumen general",
    products: "Inventario",
    customers: "Clientes",
    sales: "Ventas"
  };

  return labels[tab];
}

export default App;
