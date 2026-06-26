import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const reportsRouter = Router();

reportsRouter.get("/summary", async (_request, response) => {
  const [sales, productCount, customerCount, lowStockProducts, recentSales] = await Promise.all([
    prisma.sale.findMany({
      where: { status: "COMPLETED" },
      select: { total: true, createdAt: true }
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.customer.count(),
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { stock: "asc" }
    }),
    prisma.sale.findMany({
      include: {
        customer: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthSales = sales.filter((sale) => {
    const date = new Date(sale.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const monthRevenue = monthSales.reduce((sum, sale) => sum + Number(sale.total), 0);

  return response.json({
    totalRevenue,
    monthRevenue,
    salesCount: sales.length,
    productCount,
    customerCount,
    lowStockProducts: lowStockProducts
      .filter((product) => product.stock <= product.minStock)
      .map((product) => ({
        ...product,
        price: Number(product.price)
      })),
    recentSales: recentSales.map((sale) => ({
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
  });
});
