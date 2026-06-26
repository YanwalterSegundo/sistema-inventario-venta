# Sistema de Inventario y Ventas

Sistema fullstack para gestionar productos, stock, clientes, ventas y reportes basicos de un negocio pequeno.

Este proyecto forma parte de mi portafolio como desarrollador fullstack. La aplicacion simula un panel administrativo para una tienda o negocio local, con autenticacion, mantenimiento de datos y control automatico de stock al registrar ventas.

## Funcionalidades

- Inicio de sesion con JWT
- Dashboard con metricas principales
- Gestion de categorias
- Gestion de productos
- Control de stock y alerta de stock bajo
- Gestion de clientes
- Registro de ventas con detalle de productos
- Descuento automatico de stock al vender
- Reporte basico de ventas recientes

## Tecnologias

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend**
- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT

**Base de datos**
- PostgreSQL

## Estructura

```txt
sistema-inventario-ventas/
  apps/
    api/       Backend con Express, Prisma y PostgreSQL
    web/       Frontend con React, TypeScript y Vite
  README.md
  package.json
  pnpm-workspace.yaml
```

## Modelo de datos

Tablas principales:

```txt
users
categories
products
customers
sales
sale_items
```

## Credenciales demo

```txt
Email: admin@demo.com
Password: Demo12345
```

## Instalacion local

Requisitos:

- Node.js
- pnpm
- PostgreSQL

1. Clonar el repositorio:

```bash
git clone https://github.com/YanwalterSegundo/sistema-inventario-ventas.git
cd sistema-inventario-ventas
```

2. Instalar dependencias:

```bash
pnpm install
```

3. Configurar variables de entorno del backend:

```bash
cp apps/api/.env.example apps/api/.env
```

Editar `apps/api/.env` con la URL de PostgreSQL.

4. Crear tablas y cargar datos demo:

```bash
pnpm --dir apps/api prisma:migrate
pnpm --dir apps/api prisma:seed
```

5. Levantar backend y frontend:

```bash
pnpm dev
```

La aplicacion web queda disponible en:

```txt
http://localhost:5173
```

La API queda disponible en:

```txt
http://localhost:4000/api
```

## Endpoints principales

```txt
POST   /api/auth/login
GET    /api/reports/summary
GET    /api/categories
POST   /api/categories
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id
GET    /api/sales
POST   /api/sales
```

## Estado del proyecto

Primera version en desarrollo:

- [x] Estructura fullstack
- [x] Modelo de base de datos
- [x] API inicial
- [x] Interfaz administrativa inicial
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Capturas para README

## Contacto

- GitHub: https://github.com/YanwalterSegundo
- LinkedIn: https://www.linkedin.com/in/ywsvila
