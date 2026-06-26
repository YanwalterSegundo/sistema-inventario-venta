import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const productsRouter = Router();

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0).default(5),
  categoryId: z.coerce.number().int().positive()
});

productsRouter.get("/", async (request, response) => {
  const search = String(request.query.search ?? "").trim();

  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } }
          ]
        : undefined
    },
    include: { category: true },
    orderBy: { updatedAt: "desc" }
  });

  return response.json(
    products.map((product) => ({
      ...product,
      price: Number(product.price)
    }))
  );
});

productsRouter.post("/", async (request, response) => {
  const result = productSchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({ message: "Datos de producto invalidos" });
  }

  const product = await prisma.product.create({
    data: {
      ...result.data,
      name: result.data.name.trim(),
      sku: result.data.sku.trim().toUpperCase()
    },
    include: { category: true }
  });

  return response.status(201).json({ ...product, price: Number(product.price) });
});

productsRouter.put("/:id", async (request, response) => {
  const productId = Number(request.params.id);
  const result = productSchema.safeParse(request.body);

  if (!Number.isInteger(productId) || productId <= 0) {
    return response.status(400).json({ message: "ID de producto invalido" });
  }

  if (!result.success) {
    return response.status(400).json({ message: "Datos de producto invalidos" });
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...result.data,
      name: result.data.name.trim(),
      sku: result.data.sku.trim().toUpperCase()
    },
    include: { category: true }
  });

  return response.json({ ...product, price: Number(product.price) });
});

productsRouter.delete("/:id", async (request, response) => {
  const productId = Number(request.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return response.status(400).json({ message: "ID de producto invalido" });
  }

  await prisma.product.update({
    where: { id: productId },
    data: { active: false }
  });

  return response.status(204).send();
});
