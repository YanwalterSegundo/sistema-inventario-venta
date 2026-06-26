import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const customersRouter = Router();

const customerSchema = z.object({
  name: z.string().min(2),
  document: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal(""))
});

customersRouter.get("/", async (request, response) => {
  const search = String(request.query.search ?? "").trim();

  const customers = await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { document: { contains: search, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: { updatedAt: "desc" }
  });

  return response.json(customers);
});

customersRouter.post("/", async (request, response) => {
  const result = customerSchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({ message: "Datos de cliente invalidos" });
  }

  const customer = await prisma.customer.create({
    data: {
      name: result.data.name.trim(),
      document: result.data.document?.trim() || null,
      phone: result.data.phone?.trim() || null,
      email: result.data.email?.trim() || null
    }
  });

  return response.status(201).json(customer);
});

customersRouter.put("/:id", async (request, response) => {
  const customerId = Number(request.params.id);
  const result = customerSchema.safeParse(request.body);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return response.status(400).json({ message: "ID de cliente invalido" });
  }

  if (!result.success) {
    return response.status(400).json({ message: "Datos de cliente invalidos" });
  }

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: result.data.name.trim(),
      document: result.data.document?.trim() || null,
      phone: result.data.phone?.trim() || null,
      email: result.data.email?.trim() || null
    }
  });

  return response.json(customer);
});
