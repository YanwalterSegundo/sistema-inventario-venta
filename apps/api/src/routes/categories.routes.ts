import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().min(2)
});

categoriesRouter.get("/", async (_request, response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return response.json(categories);
});

categoriesRouter.post("/", async (request, response) => {
  const result = categorySchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({ message: "Nombre de categoria invalido" });
  }

  const category = await prisma.category.create({
    data: { name: result.data.name.trim() }
  });

  return response.status(201).json(category);
});
