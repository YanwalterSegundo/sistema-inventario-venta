import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const salesRouter = Router();

const saleSchema = z.object({
  customerId: z.coerce.number().int().positive().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive()
      })
    )
    .min(1)
});

salesRouter.get("/", async (_request, response) => {
  const sales = await prisma.sale.findMany({
    include: {
      customer: true,
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  return response.json(
    sales.map((sale) => ({
      ...sale,
      total: Number(sale.total),
      items: sale.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        product: {
          ...item.product,
          price: Number(item.product.price)
        }
      }))
    }))
  );
});

salesRouter.post("/", async (request, response) => {
  const result = saleSchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({ message: "Datos de venta invalidos" });
  }

  const userId = request.user?.userId;

  if (!userId) {
    return response.status(401).json({ message: "Usuario no autenticado" });
  }

  const sale = await prisma.$transaction(async (tx) => {
    const productIds = result.data.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, active: true }
    });

    if (products.length !== productIds.length) {
      throw new Error("Uno o mas productos no existen");
    }

    const saleItems = result.data.items.map((item) => {
      const product = products.find((currentProduct) => currentProduct.id === item.productId);

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        subtotal
      };
    });

    const total = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
    const code = `VTA-${Date.now()}`;

    const createdSale = await tx.sale.create({
      data: {
        code,
        total,
        customerId: result.data.customerId ?? null,
        userId,
        items: {
          create: saleItems
        }
      },
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });

    await Promise.all(
      saleItems.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      )
    );

    return createdSale;
  });

  return response.status(201).json({
    ...sale,
    total: Number(sale.total),
    items: sale.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      product: {
        ...item.product,
        price: Number(item.product.price)
      }
    }))
  });
});
