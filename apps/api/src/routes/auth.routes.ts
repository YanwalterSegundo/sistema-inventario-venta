import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

authRouter.post("/login", async (request, response) => {
  const result = loginSchema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({ message: "Datos de acceso invalidos" });
  }

  const user = await prisma.user.findUnique({
    where: { email: result.data.email }
  });

  if (!user) {
    return response.status(401).json({ message: "Credenciales incorrectas" });
  }

  const isValidPassword = await bcrypt.compare(result.data.password, user.passwordHash);

  if (!isValidPassword) {
    return response.status(401).json({ message: "Credenciales incorrectas" });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return response.status(500).json({ message: "JWT_SECRET no configurado" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: "8h" }
  );

  return response.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
