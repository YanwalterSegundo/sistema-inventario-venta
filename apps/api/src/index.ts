import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { categoriesRouter } from "./routes/categories.routes.js";
import { customersRouter } from "./routes/customers.routes.js";
import { productsRouter } from "./routes/products.routes.js";
import { reportsRouter } from "./routes/reports.routes.js";
import { salesRouter } from "./routes/sales.routes.js";
import { authenticate } from "./middleware/auth.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/categories", authenticate, categoriesRouter);
app.use("/api/customers", authenticate, customersRouter);
app.use("/api/products", authenticate, productsRouter);
app.use("/api/reports", authenticate, reportsRouter);
app.use("/api/sales", authenticate, salesRouter);

app.use((_request, response) => {
  response.status(404).json({ message: "Ruta no encontrada" });
});

app.use(
  (
    error: Error,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(error);
    response.status(500).json({ message: "Error interno del servidor" });
  }
);

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}/api`);
});
